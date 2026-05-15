import { useState, useEffect } from 'react';

const TOKEN_KEY = 'ai_studio_auth_token';

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthenticated(false);
      return;
    }

    // 토큰 유효성 서버 확인
    fetch('/api/auth/check', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          clearToken();
          setAuthenticated(false);
        }
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const verify = async (password: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setToken(data.token);
      setAuthenticated(true);
    }
    return data;
  };

  return { authenticated, verify };
}
