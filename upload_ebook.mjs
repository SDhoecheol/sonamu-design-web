import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ .env.local 파일에서 Supabase URL과 Key를 찾을 수 없습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 업로드할 로컬 폴더 경로 (대표님이 알려주신 경로)
const localFolderPath = 'E:\\Users\\COM\\Desktop\\거래처\\2023-2024년\\포토사이\\24.10.21 2024포토사이 사진전\\포토사이 2024 전시\\포토사이 E-book';
// Supabase에 저장될 고유 폴더명 (영문 추천)
const targetFolder = 'photosai_2024';
const bucketName = 'ebooks';

async function uploadDirectory(localPath, remotePath) {
  const items = fs.readdirSync(localPath);

  for (const item of items) {
    const itemLocalPath = path.join(localPath, item);
    // 윈도우 경로(\)를 URL 경로(/)로 변환
    const itemRemotePath = path.posix.join(remotePath, item);

    if (fs.statSync(itemLocalPath).isDirectory()) {
      // 폴더인 경우 재귀 호출
      await uploadDirectory(itemLocalPath, itemRemotePath);
    } else {
      // 파일인 경우 업로드
      const fileBuffer = fs.readFileSync(itemLocalPath);
      const mimeType = mime.lookup(itemLocalPath) || 'application/octet-stream';
      
      // 한글 파일명 오류 방지: 루트 폴더의 메인 html 파일은 index.html로 변경
      let finalRemotePath = itemRemotePath;
      if (remotePath === targetFolder && item.endsWith('.html')) {
        finalRemotePath = path.posix.join(targetFolder, 'index.html');
      }
      
      console.log(`⏳ 업로드 중: ${finalRemotePath} (${mimeType})`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(finalRemotePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (error) {
        console.error(`❌ 업로드 실패 (${finalRemotePath}):`, error.message);
      } else {
        console.log(`✅ 업로드 성공: ${finalRemotePath}`);
      }
    }
  }
}

async function main() {
  console.log('🚀 E북 업로드 스크립트를 시작합니다...');
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'sdhoecheol@gmail.com',
    password: 'tel37108195'
  });

  if (authError) {
    console.error('❌ 관리자 로그인 실패:', authError.message);
    process.exit(1);
  }
  console.log('✅ 관리자 로그인 성공!');

  await uploadDirectory(localFolderPath, targetFolder);
  
  console.log('\n🎉 모든 업로드가 완료되었습니다!');
  
  const { data } = supabase.storage.from(bucketName).getPublicUrl(`${targetFolder}/index.html`);
  console.log('\n👉 E북 공개 링크 (이 주소를 복사해서 관리자 페이지에 등록하세요):');
  console.log(data.publicUrl);
}

main();
