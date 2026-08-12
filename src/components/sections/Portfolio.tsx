import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';

const categories: Record<string, { name: string, sub: string[] }> = {
  book: { name: '도서/출판', sub: ['일반 책자', '세미나 교재', '보고서', '세무회계자료'] },
  leaflet: { name: '리플렛/포스터', sub: ['리플렛', '포스터'] },
  etc: { name: '기타 인쇄물', sub: ['서식', '명함', '봉투', '상장', '스티커'] },
  promo: { name: '판촉물', sub: ['쇼핑백', '달력', '물티슈'] },
  large: { name: '실사출력', sub: ['현수막/배너', '사인물', '부착물'] },
  package: { name: '패키지', sub: [] }
};

interface PortfolioItem {
  main: string;
  sub: string;
  title: string;
  image: string;
}

const Portfolio = () => {
  const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
  const [activeMain, setActiveMain] = useState('all');
  const [activeSub, setActiveSub] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const lastIndexRef = useRef<number>(0);

  useEffect(() => {
    const fetchPortfolios = async () => {
      const { data } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        const items = data.map((d: any) => ({
          main: d.category,
          sub: d.sub_category,
          title: d.title,
          image: d.image_url
        }));
        setAllItems(items);
      }
    };
    fetchPortfolios();
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (activeMain !== 'all' && item.main !== activeMain) return false;
      if (activeSub !== 'all' && item.sub !== activeSub) return false;
      return true;
    });
  }, [activeMain, activeSub, allItems]);

  if (selectedIndex !== null) {
    lastIndexRef.current = selectedIndex;
  }
  
  const displayIndex = selectedIndex !== null ? selectedIndex : lastIndexRef.current;
  const displayItem = filteredItems[displayIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1);
      if (e.key === 'ArrowRight') setSelectedIndex(prev => prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems]);

  const activeCategory = activeMain !== 'all' ? categories[activeMain] : null;

  return (
    <section id="portfolio" className="tab-content active fade-enter px-6 py-20">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            className={`px-5 py-2 text-sm font-bold transition-all border-b-2 ${activeMain === 'all' ? 'border-navy-900 text-navy-900' : 'border-transparent text-gray-500 hover:text-navy-900'}`}
            onClick={() => { setActiveMain('all'); setActiveSub('all'); setSelectedIndex(null); }}
          >
            전체
          </button>
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              className={`px-5 py-2 text-sm font-bold transition-all border-b-2 ${activeMain === key ? 'border-navy-900 text-navy-900' : 'border-transparent text-gray-500 hover:text-navy-900'}`}
              onClick={() => { setActiveMain(key); setActiveSub('all'); setSelectedIndex(null); }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {activeCategory && activeCategory.sub.length > 0 && (
          <div className="flex justify-center flex-wrap gap-2 mt-4 fade-enter">
            <button
              className={`px-4 py-1 border rounded-md text-xs transition-all ${activeSub === 'all' ? 'border-navy-800 text-navy-800 bg-gray-50 font-bold' : 'border-gray-200 text-gray-500 hover:border-navy-800'}`}
              onClick={() => { setActiveSub('all'); setSelectedIndex(null); }}
            >
              전체보기
            </button>
            {activeCategory.sub.map(sub => (
              <button
                key={sub}
                className={`px-4 py-1 border rounded-md text-xs transition-all ${activeSub === sub ? 'border-navy-800 text-navy-800 bg-gray-50 font-bold' : 'border-gray-200 text-gray-500 hover:border-navy-800'}`}
                onClick={() => { setActiveSub(sub); setSelectedIndex(null); }}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <div className="columns-2 md:columns-3 gap-8 lg:gap-12 mt-16 space-y-8 group/grid">
          {filteredItems.map((item, idx) => (
            <div 
              key={`${item.main}-${item.sub}-${idx}`} 
              onClick={() => setSelectedIndex(idx)}
              className="break-inside-avoid fade-enter flex flex-col group/card cursor-pointer text-left mb-8 transition-all duration-300 group-hover/grid:opacity-30 hover:!opacity-100 relative hover:z-10 hover:-translate-y-2"
            >
              <div className="bg-gray-100 rounded-2xl mb-4 overflow-hidden shadow-sm group-hover/card:shadow-2xl transition-shadow relative">
                <motion.img 
                  layoutId={item.image}
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-auto object-cover group-hover/card:scale-105 transition-transform duration-500" 
                />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1 px-1">
                {categories[item.main].name}{item.sub ? ` > ${item.sub}` : ''}
              </p>
              <p className="font-bold text-base text-navy-900 group-hover/card:text-blue-600 transition-colors px-1">{item.title}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 inline-block px-5 py-2.5 rounded-full">
            본 페이지의 포트폴리오 썸네일은 소나무디자인의 실제 작업 결과물을 바탕으로 AI 기술을 활용해 연출된 이미지입니다.
          </p>
        </div>
      </div>

      {/* Lightbox / Modal */}
      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {selectedIndex !== null && displayItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12" style={{ position: 'fixed' }}>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/95 cursor-pointer"
                onClick={() => setSelectedIndex(null)}
              />
              
              <motion.div 
                layoutId={displayItem.image}
                className="relative z-10 max-w-6xl w-full h-full flex flex-col items-center justify-center pointer-events-none"
              >
                <img 
                  src={displayItem.image} 
                  alt={displayItem.title} 
                  className="max-h-[80vh] max-w-full object-contain pointer-events-auto shadow-2xl rounded-lg"
                />
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="mt-6 text-center pointer-events-auto"
                >
                   <p className="text-gray-400 text-sm mb-2">{categories[displayItem.main].name}</p>
                   <h3 className="text-white text-2xl md:text-3xl font-bold">{displayItem.title}</h3>
                </motion.div>
              </motion.div>
              
              {/* Navigation arrows */}
              <div className="absolute inset-y-0 left-2 md:left-8 flex items-center z-20">
                <button 
                  className="p-2 md:p-4 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1);
                  }}
                >
                  <span className="material-symbols-outlined text-3xl md:text-4xl block leading-none">chevron_left</span>
                </button>
              </div>
              <div className="absolute inset-y-0 right-2 md:right-8 flex items-center z-20">
                <button 
                  className="p-2 md:p-4 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(prev => prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0);
                  }}
                >
                  <span className="material-symbols-outlined text-3xl md:text-4xl block leading-none">chevron_right</span>
                </button>
              </div>
              
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 md:top-8 md:right-8 z-20 p-2 md:p-3 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 hover:rotate-90 hover:scale-110"
                onClick={() => setSelectedIndex(null)}
              >
                <span className="material-symbols-outlined text-2xl md:text-3xl block leading-none">close</span>
              </button>
            </div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}
    </section>
  );
};
export default Portfolio;
