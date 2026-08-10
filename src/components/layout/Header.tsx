import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: '홈' },
    { id: 'services', label: '서비스 안내' },
    { id: 'portfolio', label: '포트폴리오' },
    { id: 'equipment', label: '보유 장비' },
    { id: 'contact', label: '오시는 길' }
  ];

  return (
    <header className="w-full bg-navy-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col items-center">
        <div className="text-center mb-5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('home')}>
          <h1 className="font-mont font-bold text-2xl tracking-wider">SONAMU<span className="text-blue-400">.</span></h1>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase">Design & Printing Solution</p>
        </div>
        <nav>
          <ul className="flex flex-wrap justify-center items-center gap-4 md:gap-10">
            {menuItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveTab(item.id)} 
                  className={`px-2 py-1 transition-colors ${activeTab === item.id ? 'text-white font-bold border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
