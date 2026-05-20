// api/proxy.js - Fixed version with proper headers
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }

  // OPTIONS request handle
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
    // স্ট্রিমিং সার্ভারের জন্য proper headers
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Origin': 'http://103.59.176.72:8083',
        'Referer': 'http://103.59.176.72:8083/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Proxy error: ${response.status} for ${targetUrl}`);
      return new Response(`Failed to fetch: ${response.status}`, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    // M3U8 ফাইল handle
    if (contentType.includes('mpegurl') || contentType.includes('vnd.apple.mpegurl') || targetUrl.includes('.m3u8')) {
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      
      const proxiedLines = text.split('\n').map(line => {
        const trimmed = line.trim();
        
        // কমেন্ট বা খালি লাইন skip
        if (trimmed.startsWith('#') || trimmed === '') {
          return line;
        }
        
        // URL গুলো প্রক্সি করে দিন
        if (trimmed.match(/\.(ts|m3u8|key|mp4|m4s|aac|mp3|vtt)$/i)) {
          let fullUrl;
          if (trimmed.startsWith('http')) {
            fullUrl = trimmed;
          } else {
            fullUrl = baseUrl + trimmed;
          }
          return `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
        }
        
        return line;
      });

      return new Response(proxiedLines.join('\n'), {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    // Binary content (video segments)
    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': contentType || 'video/mp2t',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      }
    });

  } catch (error) {
    console.error('Proxy error:', error.message);
    return new Response(`Proxy error: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}