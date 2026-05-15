import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

declare module 'express-session' {
  interface SessionData {
    highVolumeAuth?: boolean;
  }
}

router.post('/auth/verify', (req: Request, res: Response): void => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ success: false, message: '비밀번호를 입력해주세요.' });
      return;
    }

    const correctPassword = process.env.HIGH_VOLUME_PASSWORD;

    if (!correctPassword) {
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    if (password === correctPassword) {
      req.session.highVolumeAuth = true;
      res.json({ success: true, message: '인증되었습니다.' });
      return;
    }

    res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
  } catch (error: unknown) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: '인증 중 오류가 발생했습니다.' });
  }
});

router.get('/auth/check', (req: Request, res: Response): void => {
  res.json({ authenticated: !!req.session.highVolumeAuth });
});

router.post('/auth/logout', (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: '로그아웃 중 오류가 발생했습니다.' });
      return;
    }
    res.json({ success: true, message: '로그아웃되었습니다.' });
  });
});

export default router;
