// api/proxy.js
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Origin': 'https://abdur-live.vercel.app',
        'Referer': 'https://abdur-live.vercel.app/'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Stream fetch failed' });
    }

    // Stream headers ও content type কপি করুন
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Origin');

    // M3U8 কনটেন্ট পাস-থ্রু
    const text = await response.text();
    
    // ভিতরের .ts ফাইল বা চাইল্ড .m3u8 URL গুলো প্রক্সি দিয়ে রিপ্লেস
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    const proxiedText = text.replace(
      /^(?!#)(.+\.(?:m3u8|ts|key))$/gm,
      (match) => {
        if (match.startsWith('http')) {
          return `/api/proxy?url=${encodeURIComponent(match)}`;
        }
        return `/api/proxy?url=${encodeURIComponent(baseUrl + match)}`;
      }
    );
    
    res.send(proxiedText);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Stream proxy failed' });
  }
}