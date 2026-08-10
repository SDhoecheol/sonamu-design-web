import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
let url, key;
envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.substring('VITE_SUPABASE_URL='.length).trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.substring('VITE_SUPABASE_ANON_KEY='.length).trim();
});

const supabase = createClient(url, key);

const allItems = [
  { main: 'book', sub: '보고서', title: '계양구가족센터 사업보고서', image: '/images/portfolio/계양구가족센터_사업보고서.jpg' },
  { main: 'promo', sub: '쇼핑백', title: '계양구가족센터 쇼핑백', image: '/images/portfolio/계양구가족센터_쇼핑백.jpg' },
  { main: 'leaflet', sub: '포스터', title: '고용노동부 기업지원제도 설명회 포스터', image: '/images/portfolio/고용노동부_기업지원제도_설명회_포스터.jpg' },
  { main: 'book', sub: '일반 책자', title: '고용노동부 기업지원종합서비스 가이드북', image: '/images/portfolio/고용노동부_기업지원종합서비스_가이드북.jpg' },
  { main: 'leaflet', sub: '포스터', title: '고용노동부 기업지원종합서비스 설명회 포스터', image: '/images/portfolio/고용노동부_기업지원종합서비스_설명회_포스터.jpg' },
  { main: 'promo', sub: '쇼핑백', title: '국민체력100 쇼핑백', image: '/images/portfolio/국민체력100_쇼핑백.jpg' },
  { main: 'large', sub: '현수막/배너', title: '대한위생사협회 창립총회 현수막', image: '/images/portfolio/대한위생사협회 - 창립총회 현수막 (2023년).jpg' },
  { main: 'promo', sub: '달력', title: '미추홀구 2024 탁상달력', image: '/images/portfolio/미추홀구_2024_탁상달력.jpg' },
  { main: 'large', sub: '현수막/배너', title: '미추홀구 ESG행정 직원교육 배너', image: '/images/portfolio/미추홀구_ESG행정_직원교육_배너.jpg' },
  { main: 'leaflet', sub: '리플렛', title: '미추홀구 도시농업 리플렛', image: '/images/portfolio/미추홀구_도시농업_리플렛.jpg' },
  { main: 'book', sub: '일반 책자', title: '미추홀구 복지서비스 알림집', image: '/images/portfolio/미추홀구_복지서비스_알림집.jpg' },
  { main: 'leaflet', sub: '포스터', title: '미추홀구 적극행정우수공무원 포스터', image: '/images/portfolio/미추홀구_적극행정우수공무원_포스터.jpg' },
  { main: 'promo', sub: '달력', title: '미추홀구 치매안심센터 달력', image: '/images/portfolio/미추홀구_치매안심센터_달력.jpg' },
  { main: 'book', sub: '일반 책자', title: '미추홀구보건소 사업안내 책자', image: '/images/portfolio/미추홀구보건소_사업안내_책자.jpg' },
  { main: 'leaflet', sub: '리플렛', title: '미추홀구의회 현황 리플렛', image: '/images/portfolio/미추홀구의회_현황_리플렛.jpg' },
  { main: 'book', sub: '일반 책자', title: '신포동 포토에세이 책자', image: '/images/portfolio/신포동_포토에세이_책자.jpg' },
  { main: 'book', sub: '일반 책자', title: '인성여자고등학교 교지', image: '/images/portfolio/인성여자고등학교_교지_표지.jpg' },
  { main: 'book', sub: '일반 책자', title: '인성여자고등학교 홍보책자', image: '/images/portfolio/인성여자고등학교_홍보책자.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천관광기업지원센터 관광기업소개', image: '/images/portfolio/인천관광기업지원센터_관광기업소개.jpg' },
  { main: 'leaflet', sub: '포스터', title: '인천광역시 고령운전자 운전면허 포스터', image: '/images/portfolio/인천광역시_고령운전자_운전면허_포스터.jpg' },
  { main: 'large', sub: '현수막/배너', title: '인천광역시 우리동네시청 현수막', image: '/images/portfolio/인천광역시_우리동네시청_현수막.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천마약퇴치운동본부 공모전 입상작', image: '/images/portfolio/인천마약퇴치운동본부_공모전_입상작.jpg' },
  { main: 'promo', sub: '달력', title: '인천소방본부 2024 달력', image: '/images/portfolio/인천소방본부_2024_달력.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천시민대학 시민라이프칼리지 프로그램', image: '/images/portfolio/인천시민대학_시민라이프칼리지_프로그램.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천학회 포럼 책자', image: '/images/portfolio/인천학회_포럼_책자.jpg' },
  { main: 'large', sub: '현수막/배너', title: '자원순환센터 선진시설견학 현수막', image: '/images/portfolio/자원순환센터 선진시설견학 현수막 (2023년).jpg' },
  { main: 'book', sub: '세무회계자료', title: '재무제표 감사보고서', image: '/images/portfolio/재무제표_감사보고서.jpg' },
  { main: 'large', sub: '현수막/배너', title: '찾아가는 열린시장실 현수막', image: '/images/portfolio/찾아가는 열린시장실 현수막 (2023년).jpg' },
  { main: 'large', sub: '현수막/배너', title: '취업특강 초대형 현수막', image: '/images/portfolio/취업특강 초대형 현수막 (2023년).jpg' },
  { main: 'large', sub: '현수막/배너', title: '푸른두레생협 착한소비 녹색소비 배너', image: '/images/portfolio/푸른두레생협_착한소비_녹색소비_배너.jpg' },
  { main: 'large', sub: '현수막/배너', title: '한국마약퇴치운동본부 당선작전시회 배너', image: '/images/portfolio/한국마약퇴치운동본부_당선작전시회_배너.jpg' },
  { main: 'leaflet', sub: '리플렛', title: '한국마약퇴치운동본부 마약예방 리플렛', image: '/images/portfolio/한국마약퇴치운동본부_마약예방_리플렛.jpg' },
  { main: 'book', sub: '일반 책자', title: 'IGC 방학캠프 작품집', image: '/images/portfolio/IGC_방학캠프_작품집.jpg' },
];

async function run() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'sdhoecheol@gmail.com',
    password: 'tel37108195'
  });

  if (authError) {
    console.error("Auth failed:", authError);
    return;
  }

  for (const item of allItems) {
    const { error } = await supabase.from('portfolios').insert({
      title: item.title,
      category: item.main,
      sub_category: item.sub,
      image_url: item.image
    });
    
    if (error) {
      console.error("Failed:", item.title, error.message);
    } else {
      console.log("Inserted:", item.title);
    }
  }
  
  console.log("Migration complete!");
}

run();
