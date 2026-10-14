export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const { configUrl } = req.query;
    if (!configUrl || typeof configUrl !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'configUrl 파라미터가 필요합니다.' }));
    }

    // SSRF 방어: URL 파싱 및 허용 도메인 화이트리스트 검증
    let parsedUrl;
    try {
      parsedUrl = new URL(configUrl);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: '유효한 URL 형식이 아닙니다.' }));
    }

    if (parsedUrl.protocol !== 'https:') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: '보안을 위해 HTTPS URL만 허용됩니다.' }));
    }

    // AWS S3, CloudFront, Supabase 스토리지 도메인만 허용
    const isAllowedHost = 
      parsedUrl.hostname.endsWith('.amazonaws.com') ||
      parsedUrl.hostname.endsWith('.cloudfront.net') ||
      parsedUrl.hostname.endsWith('.supabase.co');

    if (!isAllowedHost) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: '허용되지 않은 호스트 주소입니다.' }));
    }

    const fetchRes = await fetch(configUrl);
    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch config: ${fetchRes.statusText}`);
    }

    const text = await fetchRes.text();
    let pageCount = 0;

    // textForPages = ["page 1 text", "page 2 text", ...];
    const match = text.match(/var textForPages =\[(.*?)\]/s);
    if (match) {
      const arrayContent = match[1];
      pageCount = 1;
      let inString = false;
      for (let i = 0; i < arrayContent.length; i++) {
        if (arrayContent[i] === '"' && (i === 0 || arrayContent[i-1] !== '\\')) {
          inString = !inString;
        }
        if (arrayContent[i] === ',' && !inString) {
          pageCount++;
        }
      }
    } else {
      throw new Error('textForPages variable not found in config');
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ totalPages: pageCount }));
  } catch (error) {
    console.error('Page Count Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
}
