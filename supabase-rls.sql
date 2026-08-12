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
