import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

export default function PortfolioManager() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('book');
  const [subCategory, setSubCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const fetchPortfolios = async () => {
    const { data } = await supabase
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

    try {
      await supabase.from('portfolios').delete().eq('id', id);

      if (imageUrl.includes('supabase.co')) {
        const filePath = imageUrl.split('/portfolios/')[1];
        if (filePath) {
          await supabase.storage.from('portfolios').remove([filePath]);
        }
      }
      
      toast.success('포트폴리오가 삭제되었습니다.');
      fetchPortfolios();
    } catch (error: any) {
      toast.error(`삭제 실패: ${error.message}`);
    }
  };

  const handleEditClick = (item: any) => {
    setEditId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setSubCategory(item.sub_category);
    setExistingImageUrl(item.image_url);
    setFile(null); // 수정 모드 진입 시 새 파일은 비워둠
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setSubCategory('');
    setFile(null);
    setExistingImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !subCategory) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }
    // 새 등록인데 이미지가 없으면 막기
    if (!editId && !file) {
      toast.error('대표 이미지를 업로드해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = existingImageUrl;

      if (file) {
        let uploadFile = file;
        if (file.type.startsWith('image/')) {
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' };
          try { uploadFile = await imageCompression(file, options); } catch (error) { console.error(error); }
        }

        const fileExt = 'webp';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolios').upload(fileName, uploadFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      if (editId) {
        // 수정
        const { error: dbError } = await supabase.from('portfolios').update({
          title, category, sub_category: subCategory, image_url: finalImageUrl,
        }).eq('id', editId);
        if (dbError) throw dbError;
        toast.success('성공적으로 수정되었습니다!');
      } else {
        // 새 등록
        const { error: dbError } = await supabase.from('portfolios').insert({
          title, category, sub_category: subCategory, image_url: finalImageUrl,
        });
        if (dbError) throw dbError;
        toast.success('성공적으로 등록되었습니다!');
      }
      
      resetForm();
      fetchPortfolios();
    } catch (error: any) {
      toast.error(`에러가 발생했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredPortfolios = portfolios.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sub_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage) || 1;
  const displayedPortfolios = filteredPortfolios.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 검색어가 바뀔 때마다 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/sd-master')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-3xl font-bold text-navy-900">포트폴리오 관리</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-navy-900">{editId ? '포트폴리오 수정' : '새 포트폴리오 추가'}</h3>
            {editId && (
              <button onClick={resetForm} className="text-xs text-gray-500 hover:text-navy-900 underline">
                작성 취소
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대분류</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" required>
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
              <input type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지 {editId && '(변경시에만 업로드)'}</label>
              {editId && existingImageUrl && !file && (
                <div className="mb-2 w-full h-32 bg-gray-100 rounded overflow-hidden">
                  <img src={existingImageUrl} alt="기존 이미지" className="w-full h-full object-cover opacity-70" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500 text-sm" />
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-navy-900 text-white p-3 rounded font-medium hover:bg-navy-800 disabled:bg-gray-400 mt-4 transition-colors">
              {isUploading ? '업로드 중...' : editId ? '수정 내용 저장하기' : '포트폴리오 등록하기'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 gap-4">
            <h3 className="text-lg font-bold">등록된 포트폴리오 ({filteredPortfolios.length}개)</h3>
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="제목, 분류 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-navy-500 text-sm"
              />
              <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400 text-lg">search</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">데이터를 불러오는 중...</div>
          ) : (
            <>
              {displayedPortfolios.length === 0 ? (
                <div className="text-center py-10 text-gray-500">검색 결과가 없습니다.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {displayedPortfolios.map(item => (
                    <div key={item.id} className={`border rounded overflow-hidden group relative transition-all ${editId === item.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                      <div className="h-32 bg-gray-100 relative">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(item)} className="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center" title="수정">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(item.id, item.image_url)} className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center" title="삭제">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mb-1">{item.category} &gt; {item.sub_category}</p>
                        <p className="font-bold text-sm text-gray-900 truncate">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    이전
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-navy-900 text-white' : 'hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
