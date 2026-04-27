const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3100';

// API Key is loaded from environment variables — never hardcode secrets in source code.
// Set NEXT_PUBLIC_API_KEY in .env.local (which is .gitignored).
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export async function apiRequest(method: string, path: string, body?: unknown) {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${DEFAULT_API_KEY}`,
    };
    if (body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(
      `[API ERROR] Failed to fetch ${path}. Ensure the backend is running at ${API_BASE}.`,
      error,
    );
    return null;
  }
}
