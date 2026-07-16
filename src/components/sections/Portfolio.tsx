import { useState, useMemo } from 'react';

const categories: Record<string, { name: string, sub: string[] }> = {
  book: { name: '도서/출판', sub: ['일반 책자', '세미나 교재', '보고서', '세무회계자료'] },
  leaflet: { name: '리플렛/포스터', sub: [] },
  etc: { name: '기타 인쇄물', sub: ['서식', '명함', '봉투', '상장', '스티커'] },
  promo: { name: '판촉물', sub: [] },
  large: { name: '실사출력', sub: ['현수막/배너', '사인물', '부착물'] },
  package: { name: '패키지', sub: [] }
};

interface PortfolioItem {
  main: string;
  sub: string;
  title: string;
}

const allItems: PortfolioItem[] = [];
Object.keys(categories).forEach(catKey => {
  const cat = categories[catKey];
  if (cat.sub.length > 0) {
    cat.sub.forEach(subName => {
      for (let i = 1; i <= 4; i++) {
        allItems.push({ main: catKey, sub: subName, title: `${subName} ${i}` });
      }
    });
  } else {
    for (let i = 1; i <= 4; i++) {
      allItems.push({ main: catKey, sub: "", title: `${cat.name} ${i}` });
    }
  }
});

const Portfolio = () => {
  const [activeMain, setActiveMain] = useState('all');
  const [activeSub, setActiveSub] = useState('all');

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (activeMain !== 'all' && item.main !== activeMain) return false;
      if (activeSub !== 'all' && item.sub !== activeSub) return false;
      return true;
    });
  }, [activeMain, activeSub]);

  const activeCategory = activeMain !== 'all' ? categories[activeMain] : null;

  return (
    <section id="portfolio" className="tab-content active fade-enter px-6 py-20">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeMain === 'all' ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            onClick={() => { setActiveMain('all'); setActiveSub('all'); }}
          >
            전체
          </button>
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeMain === key ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              onClick={() => { setActiveMain(key); setActiveSub('all'); }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {activeCategory && activeCategory.sub.length > 0 && (
          <div className="flex justify-center flex-wrap gap-2 mt-4 fade-enter">
            <button
              className={`px-4 py-1 border rounded-full text-xs transition-all ${activeSub === 'all' ? 'border-navy-800 text-navy-800 bg-blue-50 font-bold' : 'border-gray-200 text-gray-500 hover:border-navy-800'}`}
              onClick={() => setActiveSub('all')}
            >
              전체보기
            </button>
            {activeCategory.sub.map(sub => (
              <button
                key={sub}
                className={`px-4 py-1 border rounded-full text-xs transition-all ${activeSub === sub ? 'border-navy-800 text-navy-800 bg-blue-50 font-bold' : 'border-gray-200 text-gray-500 hover:border-navy-800'}`}
                onClick={() => setActiveSub(sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {filteredItems.map((item, idx) => (
            <div key={`${item.main}-${item.sub}-${idx}`} className="fade-enter bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow cursor-pointer">
              <div className="aspect-[3/4] bg-gray-100 rounded-xl mb-3 overflow-hidden group">
                <div className="w-full h-full bg-slate-100 group-hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-5xl">image</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mb-1">
                {categories[item.main].name}{item.sub ? ` > ${item.sub}` : ''}
              </p>
              <p className="font-bold text-sm text-navy-900">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Portfolio;
