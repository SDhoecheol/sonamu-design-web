import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Toaster position="top-center" />
      <Header />
      <main>
        <Outlet />
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
