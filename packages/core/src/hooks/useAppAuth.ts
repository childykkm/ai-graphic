const APP_AUTH_KEY = 'ai_studio_app_auth';

export function getAppAuthToken(): string | null {
  try {
    return localStorage.getItem(APP_AUTH_KEY);
  } catch {
    return null;
  }
}

export function setAppAuthToken(token: string): void {
  try {
    localStorage.setItem(APP_AUTH_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAppAuthToken(): void {
  try {
    localStorage.removeItem(APP_AUTH_KEY);
  } catch {
    // ignore
  }
}

export function isAppAuthenticated(): boolean {
  const token = getAppAuthToken();
  if (!token) return false;
  try {
    // 로컬 개발용 토큰 처리
    if (token.endsWith('.local')) {
      const payload = token.replace('.local', '');
      const decoded = JSON.parse(atob(payload));
      return decoded.auth === true && decoded.exp > Date.now();
    }
    // Vercel API Route 발급 토큰 처리
    const [payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    return decoded.auth === true && decoded.exp > Date.now();
  } catch {
    return false;
  }
}
