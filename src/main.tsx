import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import ErrorBoundary from './ErrorBoundary.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import NotFound from './components/pages/NotFound.tsx'

// Lazy Loading Components
const Home = lazy(() => import('./components/sections/Home.tsx'));
const Services = lazy(() => import('./components/sections/Services.tsx'));
const Portfolio = lazy(() => import('./components/sections/Portfolio.tsx'));
const Equipment = lazy(() => import('./components/sections/Equipment.tsx'));
const Contact = lazy(() => import('./components/sections/Contact.tsx'));

const AdminLayout = lazy(() => import('./components/admin/AdminLayout.tsx'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin.tsx'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard.tsx'));
const PortfolioManager = lazy(() => import('./components/admin/PortfolioManager.tsx'));
const EbookManager = lazy(() => import('./components/admin/EbookManager.tsx'));
const EbookViewerPage = lazy(() => import('./components/pages/EbookViewerPage.tsx'));

const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="equipment" element={<Equipment />} />
                <Route path="contact" element={<Contact />} />
              </Route>
              <Route path="/viewer/:id" element={<EbookViewerPage />} />
              <Route path="/sd-master" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="login" element={<AdminLogin />} />
                <Route path="portfolio" element={<PortfolioManager />} />
                <Route path="ebook" element={<EbookManager />} />
                <Route path="*" element={<Navigate to="/sd-master" replace />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
