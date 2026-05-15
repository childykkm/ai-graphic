export interface GeminiGenerateRequest {
  model: string;
  contents: { parts: GeminiPart[] };
  config?: {
    imageConfig?: {
      aspectRatio?: string;
      imageSize?: string;
    };
  };
}

export interface GeminiPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts: GeminiPart[];
    };
  }>;
}

export interface ImageResult {
  id: string;
  url: string;
  prompt: string;
}

export interface AuthVerifyRequest {
  password: string;
}

export interface AuthVerifyResponse {
  success: boolean;
  message: string;
}

export interface AuthCheckResponse {
  authenticated: boolean;
}
