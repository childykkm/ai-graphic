import express, { Request, Response, Router } from 'express';
import { GoogleGenAI } from '@google/genai';

const router: Router = express.Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: 'API key not configured', message: 'Server configuration error.' });
      return;
    }

    const { model, contents, config } = req.body;

    if (!model || !contents) {
      res.status(400).json({ error: 'Invalid request', message: 'Model and contents are required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({ model, contents, config });
    res.json(response);
  } catch (error: unknown) {
    console.error('Generation error:', error);

    const err = error as { status?: number; retryAfter?: number; message?: string };

    if (err.status === 429) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: '생성 속도 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
        retryAfter: err.retryAfter ?? 60,
      });
      return;
    }

    if (err.status === 403) {
      res.status(403).json({ error: 'Permission denied', message: 'API 키에 모델 접근 권한이 없습니다.' });
      return;
    }

    res.status(500).json({ error: 'Generation failed', message: err.message ?? '이미지 생성 중 오류가 발생했습니다.' });
  }
});

export default router;
