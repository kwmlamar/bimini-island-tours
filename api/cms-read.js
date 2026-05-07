// Vercel serverless function — reads tours.json from GitHub for the CMS
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const password = req.headers['x-cms-password'];
  if (!password || password !== process.env.CMS_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Server misconfigured: missing GITHUB_TOKEN' });
  }

  try {
    const r = await fetch(
      'https://api.github.com/repos/kwmlamar/bimini-island-tours/contents/_data/tours.json',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'bimini-cms'
        }
      }
    );

    if (!r.ok) {
      const err = await r.json();
      return res.status(r.status).json({ error: err.message });
    }

    const data = await r.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
    res.json({ content, sha: data.sha });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
