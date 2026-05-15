import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Vercel body size limit 늘리기 (기본 4.5MB → 50MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { model, contents, config } = req.body;

    if (!model || !contents) {
      return res.status(400).json({ error: 'Invalid request', message: 'Model and contents are required' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({ model, contents, config });
    return res.status(200).json(response);
  } catch (error: unknown) {
    console.error('Generation error:', error);
    const err = error as { status?: number; retryAfter?: number; message?: string };

    if (err.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: '생성 속도 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
        retryAfter: err.retryAfter ?? 60,
      });
    }
    if (err.status === 403) {
      return res.status(403).json({ error: 'Permission denied', message: 'API 키에 모델 접근 권한이 없습니다.' });
    }
    return res.status(500).json({ error: 'Generation failed', message: err.message ?? '이미지 생성 중 오류가 발생했습니다.' });
  }
}
