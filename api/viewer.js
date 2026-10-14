import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { id } = req.query;

  // Supabase 환경 변수 설정
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  // 기본 설정 (에러 발생 시 폴백)
  let ogTitle = '소나무디자인 - SONAMU DESIGN';
  let ogImage = 'https://www.sonamudesign.com/images/default-og.jpg';
  let ogDescription = '인쇄 기획부터 납품까지 완벽한 파트너, 소나무디자인';

  if (id && supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // DB에서 해당 E북 데이터 조회
      const { data } = await supabase
        .from('ebooks')
        .select('title, thumbnail_url')
        .eq('id', id)
        .single();

      if (data) {
        ogTitle = data.title;
        ogImage = data.thumbnail_url || ogImage;
        ogDescription = `${data.title} - 소나무디자인 제작/지원`;
      }
    } catch (dbError) {
      console.error('Supabase fetch error:', dbError);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 1. 도메인 화이트리스트 및 안전한 baseUrl 설정 (Host Header Injection 방지)
  const host = (req.headers.host || '').toLowerCase();
  let baseUrl = 'https://www.sonamudesign.com';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    baseUrl = `http://${host}`;
  } else if (host.endsWith('sonamudesign.com') || host.endsWith('.vercel.app')) {
    baseUrl = `https://${host}`;
  }

  const safeTitle = escapeHtml(ogTitle);
  const safeDesc = escapeHtml(ogDescription);
  const safeImage = escapeHtml(ogImage);
  const safeId = escapeHtml(id);

  try {
    // 2. Vercel 정적 호스팅된 원본 HTML(index.html) 가져오기
    const response = await fetch(`${baseUrl}/`);
    let html = await response.text();

    // 3. 로드한 원본 HTML에 메타 태그 교체 및 주입 (이스케이프 적용)
    const ogTags = `
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}/viewer/${safeId}" />`;
    
    // 기본적으로 있던 og: 태그들을 삭제 (중복 방지)
    html = html.replace(/<meta property="og:.*?" content=".*?" \/>/g, '');
    
    // <head> 바로 뒤에 커스텀 태그 삽입
    html = html.replace('<head>', `<head>\n${ogTags}`);
    
    // 브라우저 탭 타이틀 교체
    html = html.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);

    // 4. 완성된 HTML을 클라이언트(카카오톡 로봇 포함)에게 반환
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(html);
  } catch (error) {
    console.error('Error fetching index.html:', error);
    // 렌더링 실패 시 비상용 최소 HTML로 응답 (클라이언트에서 제대로 열리도록 redirect 포함)
    const fallbackHtml = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>${safeTitle}</title>
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta http-equiv="refresh" content="0; url=/" />
  </head>
  <body></body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(fallbackHtml);
  }
}
