import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI, { toFile } from 'openai';

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { model, prompt, size, imageParts } = req.body;

    if (!model || !prompt) {
      return res.status(400).json({ error: 'Invalid request', message: 'Model and prompt are required' });
    }

    const client = new OpenAI({ apiKey });

    let b64: string | undefined;

    if (imageParts && imageParts.length > 0) {
      // images.edit — 이미지 + 텍스트
      const imageFiles = await Promise.all(
        imageParts.map(async (img: { data: string; mimeType: string }, idx: number) => {
          const buffer = Buffer.from(img.data, 'base64');
          return toFile(buffer, `image_${idx}.png`, { type: 'image/png' });
        })
      );

      const response = await client.images.edit({
        model,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        image: imageFiles.length === 1 ? imageFiles[0] : imageFiles as any,
        prompt,
        n: 1,
        ...(size && { size: size as Parameters<typeof client.images.edit>[0]['size'] }),
      });

      b64 = response.data?.[0]?.b64_json;
    } else {
      // images.generate — 텍스트만
      const response = await client.images.generate({
        model,
        prompt,
        n: 1,
        response_format: 'b64_json',
        ...(size && { size: size as Parameters<typeof client.images.generate>[0]['size'] }),
      });

      b64 = response.data?.[0]?.b64_json;
    }

    if (!b64) {
      return res.status(500).json({ error: 'Generation failed', message: '이미지를 반환받지 못했습니다.' });
    }

    return res.status(200).json({ data: [{ b64_json: b64 }] });
  } catch (error: unknown) {
    console.error('OpenAI generation error:', error);
    const err = error as { status?: number; message?: string };

    if (err.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: '생성 속도 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
    if (err.status === 403) {
      return res.status(403).json({ error: 'Permission denied', message: 'API 키에 모델 접근 권한이 없습니다.' });
    }
    return res.status(500).json({ error: 'Generation failed', message: err.message ?? '이미지 생성 중 오류가 발생했습니다.' });
  }
}
