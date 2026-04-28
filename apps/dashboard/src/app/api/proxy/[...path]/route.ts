import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3100';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const searchParams = req.nextUrl.search;
  const url = `${BACKEND_URL}/${path}${searchParams}`;

  const headers = new Headers(req.headers);
  headers.set('Authorization', `Bearer ${API_KEY}`);
  headers.delete('host');

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
    });

    const responseBody = await res.blob();
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('content-encoding');

    return new NextResponse(responseBody, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Proxy Error]', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
