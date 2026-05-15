# Design Document

## Architecture Overview

### Monorepo Structure

현재 단일 애플리케이션을 모노레포 구조로 전환하여 3개의 독립적인 앱과 공통 패키지로 분리합니다.

```
ai_studio2/
├── apps/
│   ├── graphic/          # 기존 Graphic 탭 → 독립 앱
│   ├── concept/          # 기존 Concept 탭 → 독립 앱
│   └── floor/            # 기존 Floor 탭 → 독립 앱
├── packages/
│   ├── ui/               # 공통 UI 컴포넌트
│   ├── core/             # 공통 비즈니스 로직
│   ├── config/           # 공통 설정
│   ├── styles/           # 공통 스타일
│   └── assets/           # 공통 에셋
└── package.json          # 루트 패키지 (workspace 설정)
```

### Technology Stack

- **Framework**: React 19 + Vite 6.2 (파일 기반 라우팅)
- **Routing**: React Router v6 (Next.js 스타일 파일 기반 라우팅)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Framer Motion
- **Package Manager**: npm workspaces
- **API Layer**: Express.js 서버 (서버 사이드 프록시)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Security Design

### 1. API Key Management

**Problem**: API 키가 클라이언트 번들에 노출됨

**Solution**: Express.js 서버 사이드 환경변수 + API 엔드포인트

```typescript
// server/api/generate.ts
import express from 'express';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY; // 서버 사이드에서만 접근
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  const body = req.body;
  
  try {
    // Gemini API 호출
    const response = await fetch('https://generativelanguage.googleapis.com/...', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

export default router;
```

### 2. Authentication for High-Volume Usage

**Problem**: 11개 이상 생성 시 클라이언트에 하드코딩된 비밀번호 노출

**Solution**: Express.js 세션 기반 인증

```typescript
// server/api/auth.ts
import express from 'express';
import session from 'express-session';

const router = express.Router();

router.post('/auth/verify', (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.HIGH_VOLUME_PASSWORD; // 서버 사이드 환경변수
  
  if (password === correctPassword) {
    // 세션에 인증 정보 저장
    req.session.highVolumeAuth = true;
    
    return res.json({ success: true });
  }
  
  res.status(401).json({ success: false });
});

router.get('/auth/check', (req, res) => {
  res.json({ authenticated: !!req.session.highVolumeAuth });
});

export default router;
```

## API Layer Design

### 1. Rate Limiting & Retry Logic

**Problem**: 고정된 배치 크기, 재시도 로직 없음

**Solution**: 동적 배치 크기 + 지수 백오프

```typescript
// packages/core/src/api/gemini-client.ts
export class GeminiClient {
  private batchSize = 2;
  private batchDelay = 2000;
  private maxRetries = 3;
  
  async generateImages(requests: ImageRequest[]): Promise<ImageResult[]> {
    const results: ImageResult[] = [];
    const batches = this.createBatches(requests, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        const batchResults = await Promise.all(
          batch.map(req => this.generateWithRetry(req))
        );
        results.push(...batchResults);
        
        // 마지막 배치가 아니면 대기
        if (i < batches.length - 1) {
          await this.delay(this.batchDelay);
        }
      } catch (error) {
        // 부분 성공 저장
        results.push(...this.getPartialResults(batch));
        throw error;
      }
    }
    
    return results;
  }
  
  private async generateWithRetry(
    request: ImageRequest,
    attempt = 0
  ): Promise<ImageResult> {
    try {
      return await this.generate(request);
    } catch (error) {
      if (this.isRateLimitError(error) && attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 지수 백오프
        await this.delay(delay);
        return this.generateWithRetry(request, attempt + 1);
      }
      throw error;
    }
  }
  
  private isRateLimitError(error: any): boolean {
    return error.status === 429;
  }
}
```

### 2. Cancellation Support

**Problem**: 생성 중 취소 불가능

**Solution**: AbortController 사용

```typescript
// packages/core/src/api/gemini-client.ts
export class GeminiClient {
  private abortController: AbortController | null = null;
  
  async generateImages(
    requests: ImageRequest[],
    onProgress?: (progress: number) => void
  ): Promise<ImageResult[]> {
    this.abortController = new AbortController();
    
    try {
      // ... 생성 로직
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Generation cancelled by user');
      }
      throw error;
    }
  }
  
  cancel(): void {
    this.abortController?.abort();
  }
}
```

## Component Architecture

### 1. Feature-Based Structure with File-Based Routing

각 앱은 React + Vite + React Router 기반으로 Next.js 스타일의 파일 기반 라우팅을 사용:

```
apps/graphic/
├── src/
│   ├── routes/                        # 파일 기반 라우팅 디렉토리
│   │   ├── index/                     # / 경로
│   │   │   └── page.tsx               # 메인 페이지
│   │   ├── generate/                  # /generate 경로
│   │   │   └── page.tsx
│   │   └── results/                   # /results 경로
│   │       └── page.tsx
│   ├── components/
│   │   ├── ImageUploader/
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── ImageUploader.test.tsx
│   │   │   └── index.ts
│   │   ├── OptionsPanel/
│   │   │   ├── OptionsPanel.tsx
│   │   │   ├── OptionsPanel.test.tsx
│   │   │   └── index.ts
│   │   ├── ResultsGallery/
│   │   │   ├── ResultsGallery.tsx
│   │   │   ├── ResultsGallery.test.tsx
│   │   │   └── index.ts
│   │   └── ProgressModal/
│   │       ├── ProgressModal.tsx
│   │       ├── ProgressModal.test.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useImageGeneration.ts
│   │   ├── useImageUpload.ts
│   │   └── useAuth.ts
│   ├── types/
│   │   ├── image.ts
│   │   └── api.ts
│   ├── router.tsx                     # React Router 설정
│   └── main.tsx                       # 앱 진입점
├── server/                            # Express.js 서버
│   ├── api/
│   │   ├── generate.ts                # 이미지 생성 API
│   │   └── auth.ts                    # 인증 API
│   ├── middleware/
│   │   └── session.ts
│   └── index.ts                       # 서버 진입점
└── package.json
```

### 2. File-Based Routing Implementation

React Router를 사용한 파일 기반 라우팅 구현:

```typescript
// apps/graphic/src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// 자동으로 routes 디렉토리의 page.tsx 파일들을 로드
const routes = import.meta.glob('./routes/**/page.tsx');

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('./routes/index/page'),
  },
  {
    path: '/generate',
    lazy: () => import('./routes/generate/page'),
  },
  {
    path: '/results',
    lazy: () => import('./routes/results/page'),
  },
]);
```

```typescript
// apps/graphic/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

```typescript
// apps/graphic/src/routes/index/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>AI Graphic Generator</h1>
      {/* 메인 페이지 컨텐츠 */}
    </div>
  );
}
```

### 2. Shared UI Components

공통 UI 컴포넌트는 `packages/ui`에 배치:

```typescript
// packages/ui/src/Button/Button.tsx
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
}) => {
  // 구현
};
```

## State Management

### 1. Local State with Hooks

복잡한 상태 관리 라이브러리 대신 커스텀 훅 사용:

```typescript
// apps/graphic/src/hooks/useImageGeneration.ts
export interface UseImageGenerationReturn {
  isGenerating: boolean;
  progress: number;
  results: ImageResult[];
  error: string | null;
  generate: (options: GenerationOptions) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<GeminiClient | null>(null);
  
  const generate = async (options: GenerationOptions) => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    
    try {
      clientRef.current = new GeminiClient();
      const results = await clientRef.current.generateImages(
        options.requests,
        (p) => setProgress(p)
      );
      setResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const cancel = () => {
    clientRef.current?.cancel();
  };
  
  const reset = () => {
    setResults([]);
    setError(null);
    setProgress(0);
  };
  
  return { isGenerating, progress, results, error, generate, cancel, reset };
}
```

## Performance Optimization

### 1. Image Optimization

**Problem**: 대용량 이미지로 인한 메모리 문제

**Solution**: 이미지 압축 + 지연 로딩

```typescript
// packages/core/src/utils/image-optimizer.ts
export class ImageOptimizer {
  static async compressImage(
    file: File,
    maxWidth: number = 1024,
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // 비율 유지하며 리사이즈
          const ratio = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  static createThumbnail(base64: string, size: number = 200): Promise<string> {
    // 썸네일 생성 로직
  }
}
```

### 2. Lazy Loading

```typescript
// apps/graphic/src/components/ResultsGallery/ResultsGallery.tsx
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {results.map((result, index) => (
        <LazyLoadImage
          key={index}
          src={result.thumbnail}
          alt={`Generated image ${index + 1}`}
          effect="blur"
          onClick={() => openFullImage(result.fullImage)}
        />
      ))}
    </div>
  );
};
```

## Type Safety

### 1. API Response Types

```typescript
// packages/core/src/types/api.ts
export interface GeminiGenerateRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }>;
  }>;
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
    responseMimeType: string;
  };
}

export interface GeminiGenerateResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    finishReason: string;
  }>;
}

export interface ImageResult {
  id: string;
  thumbnail: string;
  fullImage: string;
  prompt: string;
  timestamp: number;
}
```

### 2. Strict TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Error Handling

### 1. Structured Error Types

```typescript
// packages/core/src/errors/api-errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
  
  retryAfter?: number;
}

export class AuthenticationError extends ApiError {
  constructor() {
    super('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }
}
```

### 2. User-Friendly Error Messages

```typescript
// packages/core/src/utils/error-formatter.ts
export function formatErrorMessage(error: Error): string {
  if (error instanceof RateLimitError) {
    return `생성 속도 제한에 도달했습니다. ${error.retryAfter ? `${error.retryAfter}초 후` : '잠시 후'} 다시 시도해주세요.`;
  }
  
  if (error instanceof AuthenticationError) {
    return '11개 이상의 이미지를 생성하려면 인증이 필요합니다.';
  }
  
  if (error.message.includes('API key')) {
    return 'API 키가 설정되지 않았습니다. 관리자에게 문의하세요.';
  }
  
  return '이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
// apps/graphic/src/hooks/useImageGeneration.test.ts
import { renderHook, act } from '@testing-library/react';
import { useImageGeneration } from './useImageGeneration';

describe('useImageGeneration', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useImageGeneration());
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle generation success', async () => {
    const { result } = renderHook(() => useImageGeneration());
    
    await act(async () => {
      await result.current.generate(mockOptions);
    });
    
    expect(result.current.results).toHaveLength(5);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle cancellation', async () => {
    const { result } = renderHook(() => useImageGeneration());
    
    act(() => {
      result.current.generate(mockOptions);
    });
    
    act(() => {
      result.current.cancel();
    });
    
    expect(result.current.error).toContain('cancelled');
  });
});
```

### 2. Integration Tests

```typescript
// server/api/generate.test.ts
import request from 'supertest';
import app from '../index';

describe('POST /api/generate', () => {
  it('should return 500 if API key is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    
    const response = await request(app)
      .post('/api/generate')
      .send({});
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('API key not configured');
  });
  
  it('should generate images successfully', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    const response = await request(app)
      .post('/api/generate')
      .send(mockRequest);
    
    expect(response.status).toBe(200);
  });
});
```

## Migration Strategy

### Phase 1: Setup Monorepo & Express Server (Week 1)

1. 루트 `package.json`에 workspaces 설정
2. `apps/graphic` 디렉토리 생성 및 Vite + React Router 초기화
3. Express.js 서버 설정 (`server/` 디렉토리)
4. `packages/ui`, `packages/core` 생성
5. 파일 기반 라우팅 시스템 구축
6. 기본 빌드 파이프라인 구성

### Phase 2: Security & API Layer (Week 2)

1. Express.js API 엔드포인트 구현 (`/api/generate`, `/api/auth`)
2. 환경변수 마이그레이션 (서버 사이드로 이동)
3. 세션 기반 인증 구현
4. Rate limiting & retry 로직 구현
5. 클라이언트에서 서버 API 호출로 변경

### Phase 3: Component Migration (Week 3)

1. 기존 `App.tsx`를 기능별 컴포넌트로 분리
2. 파일 기반 라우팅 구조로 페이지 분리 (`routes/*/page.tsx`)
3. 공통 UI 컴포넌트를 `packages/ui`로 이동
4. 비즈니스 로직을 `packages/core`로 이동
5. 타입 정의 추가

### Phase 4: Performance & Testing (Week 4)

1. 이미지 최적화 구현
2. 지연 로딩 적용
3. 단위 테스트 작성
4. 통합 테스트 작성 (Express.js API 테스트)

### Phase 5: Documentation & Deployment (Week 5)

1. README 및 API 문서 작성
2. 배포 가이드 작성
3. CI/CD 파이프라인 구성
4. 프로덕션 배포 (Vite 빌드 + Express.js 서버)

## Backward Compatibility

모든 기존 기능은 유지되며, 다음 사항들이 보장됩니다:

1. **UI/UX**: 동일한 사용자 경험 유지
2. **프롬프트 로직**: `system_logic.md` 기반 프롬프트 생성 유지
3. **이미지 처리**: Base64 변환 및 다운로드 기능 유지
4. **애니메이션**: Framer Motion 기반 인터랙션 유지

## Success Metrics

1. **보안**: API 키 클라이언트 노출 0건
2. **성능**: 이미지 생성 성공률 95% 이상
3. **코드 품질**: TypeScript strict mode 100% 준수
4. **테스트 커버리지**: 80% 이상
5. **번들 크기**: 초기 로드 시간 3초 이내
