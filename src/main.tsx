import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AdminLayout from './components/admin/AdminLayout.tsx'
import AdminLogin from './components/admin/AdminLogin.tsx'
import AdminDashboard from './components/admin/AdminDashboard.tsx'
import PortfolioManager from './components/admin/PortfolioManager.tsx'
import EbookManager from './components/admin/EbookManager.tsx'
import EbookViewerPage from './components/pages/EbookViewerPage.tsx'

import ErrorBoundary from './ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/viewer/:id" element={<EbookViewerPage />} />
          <Route path="/sd-master" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="ebook" element={<EbookManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
