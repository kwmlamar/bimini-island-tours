// Vercel serverless function — handles GitHub OAuth callback for CMS login
export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Missing OAuth code.');
    }

    try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body:    JSON.stringify({
                client_id:     process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });

        const { access_token, error } = await tokenRes.json();

        if (error || !access_token) {
            return res.status(400).send(`GitHub OAuth error: ${error || 'No token returned'}`);
        }

        // Pass the token back to the CMS window via postMessage
        const payload = JSON.stringify({ token: access_token, provider: 'github' });
        res.setHeader('Content-Type', 'text/html');
        res.send(`<!DOCTYPE html>
<html><head><title>Signing in…</title></head>
<body>
<script>
(function () {
    var payload = ${JSON.stringify(payload)};
    function receive(e) {
        window.opener.postMessage('authorization:github:success:' + payload, e.origin);
    }
    window.addEventListener('message', receive, false);
    window.opener.postMessage('authorizing:github', '*');
})();
<\/script>
<p style="font-family:sans-serif;text-align:center;margin-top:4rem;">Signing in, please wait…</p>
</body></html>`);

    } catch (err) {
        res.status(500).send('Authentication failed: ' + err.message);
    }
}
