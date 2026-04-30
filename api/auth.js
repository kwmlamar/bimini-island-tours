// Vercel serverless function — starts GitHub OAuth flow for CMS login
export default function handler(req, res) {
    const { host } = req.headers;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl  = `${protocol}://${host}`;

    const params = new URLSearchParams({
        client_id:    process.env.GITHUB_CLIENT_ID,
        scope:        'repo,user',
        redirect_uri: `${baseUrl}/api/callback`,
        state:        Math.random().toString(36).slice(2)
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
