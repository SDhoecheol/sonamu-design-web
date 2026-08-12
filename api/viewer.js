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

  // 1. 현재 접속된 도메인 알아내기
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // 2. Vercel 정적 호스팅된 원본 HTML(index.html) 가져오기
    // baseUrl('/')을 호출하면 원본 index.html 문자열을 얻을 수 있습니다.
    const response = await fetch(`${baseUrl}/`);
    let html = await response.text();

    // 3. 로드한 원본 HTML에 메타 태그 교체 및 주입
    const ogTags = `
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${baseUrl}/viewer/${id}" />`;
    
    // 기본적으로 있던 og: 태그들을 삭제 (중복 방지)
    html = html.replace(/<meta property="og:.*?" content=".*?" \/>/g, '');
    
    // <head> 바로 뒤에 커스텀 태그 삽입
    html = html.replace('<head>', `<head>\n${ogTags}`);
    
    // 브라우저 탭 타이틀 교체
    html = html.replace(/<title>.*?<\/title>/, `<title>${ogTitle}</title>`);

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
    <title>${ogTitle}</title>
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta http-equiv="refresh" content="0; url=/" />
  </head>
  <body></body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(fallbackHtml);
  }
}
