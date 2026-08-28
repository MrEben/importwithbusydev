import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import { workProjects } from './data/workProjects'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/project/:slug" element={<ProjectPage projects={workProjects} />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
