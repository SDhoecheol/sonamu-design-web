import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function PortfolioManager() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('book');
  const [subCategory, setSubCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchPortfolios = async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPortfolios(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm('정말 이 포트폴리오를 삭제하시겠습니까?')) return;

    // 1. DB에서 삭제
    await supabase.from('portfolios').delete().eq('id', id);

    // 2. Storage에서 이미지 삭제 (URL에 supabase storage가 포함된 경우만)
    if (imageUrl.includes('supabase.co')) {
      const filePath = imageUrl.split('/portfolios/')[1];
      if (filePath) {
        await supabase.storage.from('portfolios').remove([filePath]);
      }
    }
    
    fetchPortfolios();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category || !subCategory) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. 이미지 업로드
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 이미지 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('portfolios')
        .getPublicUrl(fileName);

      // 2. DB에 데이터 추가
      const { error: dbError } = await supabase.from('portfolios').insert({
        title,
        category,
        sub_category: subCategory,
        image_url: publicUrl,
      });

      if (dbError) throw dbError;

      alert('성공적으로 추가되었습니다!');
      
      // 폼 초기화
      setTitle('');
      setSubCategory('');
      setFile(null);
      
      fetchPortfolios();
    } catch (error: any) {
      alert(`에러가 발생했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/sd-master')}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-3xl font-bold text-navy-900">포트폴리오 관리</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 새 포트폴리오 추가 폼 */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">새 포트폴리오 추가</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500 focus:border-navy-500" placeholder="예: 미추홀구 소식지" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대분류</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500 focus:border-navy-500" required>
                <option value="book">도서/출판</option>
                <option value="leaflet">리플렛/포스터</option>
                <option value="etc">기타 인쇄물</option>
                <option value="promo">판촉물</option>
                <option value="large">실사출력</option>
                <option value="package">패키지</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소분류 (직접 입력)</label>
              <input type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500 focus:border-navy-500" placeholder="예: 리플렛, 현수막, 쇼핑백 등" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500 focus:border-navy-500 text-sm" required />
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-navy-900 text-white p-3 rounded font-medium hover:bg-navy-800 disabled:bg-gray-400 mt-4">
              {isUploading ? '업로드 중...' : '포트폴리오 등록하기'}
            </button>
          </form>
        </div>

        {/* 기존 포트폴리오 목록 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">등록된 포트폴리오 목록 ({portfolios.length}개)</h3>
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">데이터를 불러오는 중입니다...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[800px] pr-2">
              {portfolios.map(item => (
                <div key={item.id} className="border border-gray-200 rounded overflow-hidden group relative">
                  <div className="h-32 bg-gray-100 relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDelete(item.id, item.image_url)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="삭제"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{item.category} &gt; {item.sub_category}</p>
                    <p className="font-bold text-sm text-gray-900 truncate">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
