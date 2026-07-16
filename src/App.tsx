import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
// We will create these placeholder components shortly
import Home from './components/sections/Home';
import Services from './components/sections/Services';
import Portfolio from './components/sections/Portfolio';
import Equipment from './components/sections/Equipment';
import Contact from './components/sections/Contact';
import YieldCalc from './components/tools/YieldCalc';
import SenecaCalc from './components/tools/SenecaCalc';
import Harikomi from './components/tools/Harikomi';
import QrGenerator from './components/tools/QrGenerator';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Scroll to top on tab change
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'home' && <Home />}
        {activeTab === 'services' && <Services />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'equipment' && <Equipment />}
        {activeTab === 'contact' && <Contact />}
        
        {/* Tools */}
        {activeTab === 'yieldcalc' && <YieldCalc />}
        {activeTab === 'calculator' && <SenecaCalc />}
        {activeTab === 'harikomi' && <Harikomi />}
        {activeTab === 'qrcode' && <QrGenerator />}
      </main>
      
      <footer className="w-full bg-navy-900 text-white py-14 text-center">
        <p className="text-[10px] text-gray-600 tracking-[0.4em] uppercase font-mont">
          © 2026 SONAMU DESIGN. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </>
  );
}

export default App;
