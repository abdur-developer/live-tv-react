// api/proxy.js
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }

  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // OPTIONS request handle
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Origin': 'https://abdur-live.vercel.app',
        'Referer': 'https://abdur-live.vercel.app/'
      }
    });

    if (!response.ok) {
      return new Response(`Stream fetch failed: ${response.status}`, { 
        status: response.status,
        headers 
      });
    }

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    const text = await response.text();

    // M3U8 ফাইলের ভিতরের URL গুলো প্রক্সি করে দিন
    if (contentType.includes('mpegurl') || contentType.includes('vnd.apple.mpegurl')) {
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      
      const proxiedText = text.split('\n').map(line => {
        // কমেন্ট বা খালি লাইন skip
        if (line.startsWith('#') || line.trim() === '') {
          return line;
        }
        
        // .ts, .m3u8, .key ফাইল handle
        if (line.match(/\.(ts|m3u8|key|mp4|m4s|m4v|aac|mp3|vtt)$/i)) {
          let fullUrl;
          if (line.startsWith('http')) {
            fullUrl = line;
          } else {
            fullUrl = baseUrl + line;
          }
          return `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
        }
        
        return line;
      }).join('\n');

      return new Response(proxiedText, {
        headers: {
          ...headers,
          'Content-Type': 'application/vnd.apple.mpegurl'
        }
      });
    }

    // Binary content (video segments) pass through
    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      headers: {
        ...headers,
        'Content-Type': contentType
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}