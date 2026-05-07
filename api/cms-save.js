// Vercel serverless function — saves tours.json to GitHub for the CMS
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const password = req.headers['x-cms-password'];
  if (!password || password !== process.env.CMS_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Server misconfigured: missing GITHUB_TOKEN' });
  }

  const { content, sha } = req.body;
  if (!content || !sha) {
    return res.status(400).json({ error: 'Missing content or sha' });
  }

  const apiUrl = 'https://api.github.com/repos/kwmlamar/bimini-island-tours/contents/_data/tours.json';

  try {
    const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

    const r = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'bimini-cms'
      },
      body: JSON.stringify({
        message: 'Update tour content via CMS',
        content: encoded,
        sha,
        branch: 'main'
      })
    });

    const result = await r.json();

    // Successful save — GitHub returns the new commit
    if (r.ok && result.commit) {
      return res.json({ success: true, sha: result.content?.sha || sha });
    }

    // SHA conflict — the file was updated since the admin last loaded it
    if (r.status === 409) {
      // Fetch the latest SHA so the client can retry
      try {
        const latest = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'bimini-cms'
          }
        });
        const latestData = await latest.json();
        return res.status(409).json({
          error: 'conflict',
          message: 'The tour data was updated elsewhere. Retrying automatically…',
          latestSha: latestData.sha
        });
      } catch (_) {
        return res.status(409).json({
          error: 'conflict',
          message: 'The tour data was updated elsewhere. Please reload and try again.'
        });
      }
    }

    // Any other GitHub API error
    return res.status(r.status || 500).json({
      error: result.message || 'GitHub API error',
      status: r.status
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
