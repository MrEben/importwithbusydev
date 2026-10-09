import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import CoursePage from './pages/CoursePage.jsx'
import ThankYouPage from './pages/ThankYouPage.jsx'
import ScrollToTop from './ScrollToTop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
