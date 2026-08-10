import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {

  return (
    <header className="w-full bg-navy-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col items-center">
        <div className="text-center mb-5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('home')}>
          <h1 className="font-mont font-bold text-2xl tracking-wider">SONAMU<span className="text-blue-400">.</span></h1>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase">Design & Printing Solution</p>
        </div>
        <nav>
          <ul className="flex flex-wrap justify-center items-center gap-4 md:gap-10">
            <li>
              <button 
                onClick={() => setActiveTab('home')} 
                className={`px-2 py-1 transition-colors ${activeTab === 'home' ? 'text-white font-bold border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                홈
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('services')} 
                className={`px-2 py-1 transition-colors ${activeTab === 'services' ? 'text-white font-bold border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                서비스 안내
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('portfolio')} 
                className={`px-2 py-1 transition-colors ${activeTab === 'portfolio' ? 'text-white font-bold border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                포트폴리오
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('equipment')} 
                className={`px-2 py-1 transition-colors ${activeTab === 'equipment' ? 'text-white font-bold border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                보유 장비
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('contact')} 
                className={`px-2 py-1 transition-colors ${activeTab === 'contact' ? 'text-white font-bold border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                오시는 길
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
