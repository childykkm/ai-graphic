import { useState, useEffect } from 'react';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setAuthenticated(data.authenticated ?? false))
      .catch(() => setAuthenticated(false));
  }, []);

  const verify = async (password: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) setAuthenticated(true);
    return data;
  };

  return { authenticated, verify };
}
