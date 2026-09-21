import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', label: '홈' },
    { path: '/portfolio', label: '포트폴리오' },
    { path: '/contact', label: '오시는 길' }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/70 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group" onClick={() => setMobileMenuOpen(false)}>
          <span className="font-mont font-black text-2xl sm:text-3xl tracking-tighter text-zinc-950 group-hover:opacity-90 transition-opacity">
            SONAMU<span className="text-emerald-700">.</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-gray-400 pl-3 border-l border-gray-200 tracking-wider">
            기획 · 디자인 · 인쇄
          </span>
        </Link>

        {/* Right: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-[15px] tracking-tight transition-colors py-1 ${
                  isActive
                    ? 'text-emerald-800 font-bold border-b-2 border-emerald-700'
                    : 'text-zinc-600 hover:text-zinc-950 font-medium'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="md:hidden p-2 text-zinc-700 hover:text-zinc-950 focus:outline-none"
          aria-label="메뉴 열기/닫기"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-lg animate-fadeIn">
          <ul className="flex flex-col gap-3">
            {menuItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 text-base ${
                      isActive
                        ? 'text-emerald-800 font-bold'
                        : 'text-zinc-700 hover:text-zinc-950 font-medium'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;

