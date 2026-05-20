// api/proxy.js
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL required', { 
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  }

  try {
    // Simple fetch without custom headers
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) {
      return new Response(`Error: ${response.status}`, { 
        status: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const data = await response.arrayBuffer();

    return new Response(data, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=5',
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Proxy failed', { 
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}