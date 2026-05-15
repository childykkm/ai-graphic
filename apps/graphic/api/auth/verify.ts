import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: '비밀번호를 입력해주세요.' });
  }

  const correctPassword = process.env.HIGH_VOLUME_PASSWORD;
  if (!correctPassword) {
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  if (password === correctPassword) {
    // JWT 대신 간단한 서명된 토큰 사용 (외부 라이브러리 불필요)
    const token = Buffer.from(
      JSON.stringify({ auth: true, exp: Date.now() + 24 * 60 * 60 * 1000 })
    ).toString('base64');
    const signature = Buffer.from(`${token}:${correctPassword}`).toString('base64');
    return res.status(200).json({ success: true, message: '인증되었습니다.', token: `${token}.${signature}` });
  }

  return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
}
