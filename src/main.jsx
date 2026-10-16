import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import CoursePage from './pages/CoursePage.jsx'
import ThankYouPage from './pages/ThankYouPage.jsx'
import TrainingThankYouPage from './pages/TrainingThankYouPage.jsx'
import UpsellPage from './pages/UpsellPage.jsx'
import LMSDashboard from './lms/LMSDashboard.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import DemoActivityNotification from './components/DemoActivityNotification.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/checkout"
          element={
            <>
              <CheckoutPage />
              <DemoActivityNotification />
            </>
          }
        />
        <Route path="/upsell" element={<UpsellPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/lms" element={<LMSDashboard />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/thank-you." element={<ThankYouPage />} />
        <Route path="/training-thank-you" element={<TrainingThankYouPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
