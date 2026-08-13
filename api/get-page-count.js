export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const { configUrl } = req.query;
    if (!configUrl) {
      throw new Error('configUrl is required');
    }

    const fetchRes = await fetch(configUrl);
    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch config from S3: ${fetchRes.statusText}`);
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
