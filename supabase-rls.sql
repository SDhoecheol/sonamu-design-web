-- Supabase SQL Editor에 복사해서 실행하세요.
-- 포트폴리오 테이블 RLS 설정
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "Public profiles are viewable by everyone." 
ON portfolios FOR SELECT USING ( true );

-- 인증된 관리자만 추가, 수정, 삭제 가능
CREATE POLICY "Users can insert their own portfolio." 
ON portfolios FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "Users can update own portfolio." 
ON portfolios FOR UPDATE USING ( auth.uid() IS NOT NULL );

CREATE POLICY "Users can delete own portfolio." 
ON portfolios FOR DELETE USING ( auth.uid() IS NOT NULL );


-- E북 테이블 RLS 설정
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public ebooks are viewable by everyone." 
ON ebooks FOR SELECT USING ( true );

CREATE POLICY "Users can insert ebooks." 
ON ebooks FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "Users can update ebooks." 
ON ebooks FOR UPDATE USING ( auth.uid() IS NOT NULL );

CREATE POLICY "Users can delete ebooks." 
ON ebooks FOR DELETE USING ( auth.uid() IS NOT NULL );


-- 전자책 방명록 테이블 RLS 설정 (무단 삭제 방지)
ALTER TABLE ebook_guestbook ENABLE ROW LEVEL SECURITY;

-- 누구나 방명록 조회 가능
CREATE POLICY "Public guestbook entries are viewable by everyone." 
ON ebook_guestbook FOR SELECT USING ( true );

-- 누구나 방명록 작성 가능
CREATE POLICY "Public users can insert guestbook entries." 
ON ebook_guestbook FOR INSERT WITH CHECK ( true );

-- 오직 로그인한 관리자만 방명록 삭제 가능
CREATE POLICY "Authenticated users can delete guestbook entries." 
ON ebook_guestbook FOR DELETE USING ( auth.uid() IS NOT NULL );


-- 인쇄기 실시간 관제 테이블 RLS 설정 (인쇄 작업 정보 보호)
ALTER TABLE printer_live_status ENABLE ROW LEVEL SECURITY;

-- 로그인한 관리자만 인쇄기 정보 조회 가능
CREATE POLICY "Authenticated users can view printer live status." 
ON printer_live_status FOR SELECT USING ( auth.uid() IS NOT NULL );

-- 로그인한 관리자(또는 Service Role)만 인쇄기 상태 업데이트/추가/삭제 가능
CREATE POLICY "Authenticated users can update printer live status." 
ON printer_live_status FOR UPDATE USING ( auth.uid() IS NOT NULL );

CREATE POLICY "Authenticated users can insert printer live status." 
ON printer_live_status FOR INSERT WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "Authenticated users can delete printer live status." 
ON printer_live_status FOR DELETE USING ( auth.uid() IS NOT NULL );
