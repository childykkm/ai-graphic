import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(200).json({ authenticated: false });
  }

  try {
    const token = authHeader.slice(7);
    const [payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

    if (decoded.auth && decoded.exp > Date.now()) {
      return res.status(200).json({ authenticated: true });
    }
    return res.status(200).json({ authenticated: false });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
}
