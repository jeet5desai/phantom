const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3100';

// API Key is loaded from environment variables — never hardcode secrets in source code.
// Set VITE_API_KEY in .env.local (which is .gitignored).
const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || '';

export async function apiRequest(method: string, path: string, body?: unknown, token?: string) {
  try {
    // In Vite dev mode, we proxy requests to /api/proxy to avoid CORS.
    // In production, we might call API_BASE directly if deployed on the same domain,
    // or configure CORS properly on the backend.
    const baseUrl = import.meta.env.DEV ? '/api/proxy' : API_BASE;

    const headers: Record<string, string> = {};

    // Prioritize Clerk token over hardcoded API key
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (DEFAULT_API_KEY) {
      headers['Authorization'] = `Bearer ${DEFAULT_API_KEY}`;
    }

    if (body) headers['Content-Type'] = 'application/json';

    const fetchPath = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const res = await fetch(fetchPath, {
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
