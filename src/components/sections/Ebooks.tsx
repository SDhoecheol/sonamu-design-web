import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Ebooks() {
  const [ebooks, setEbooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchEbooks = async () => {
      const { data } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setEbooks(data);
    };
    fetchEbooks();
  }, []);

  const handleEbookClick = async (ebook: any) => {
    // 조회수 증가
    await supabase.from('ebooks').update({ views: ebook.views + 1 }).eq('id', ebook.id);
    
    // 자체 도메인 뷰어로 열기
    window.open(`/viewer/${ebook.id}`, '_blank');
  };

  return (
    <section id="ebooks" className="tab-content active fade-enter px-6 py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-16">
          <h2 className="text-4xl font-black text-navy-900 mb-4">E-BOOK 갤러리</h2>
          <p className="text-gray-500">소나무디자인에서 정성스럽게 제작한 웹 도록(E-book) 전시관입니다.</p>
        </div>

        {ebooks.length === 0 ? (
          <div className="text-gray-400 py-20">아직 등록된 E북이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ebooks.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleEbookClick(item)}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group hover:-translate-y-2 text-left"
              >
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-white text-navy-900 font-bold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all">책 펼치기</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-2">{item.author || '소나무디자인'}</p>
                  <h3 className="font-bold text-lg text-navy-900 mb-2 line-clamp-2">{item.title}</h3>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>조회수 {item.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
