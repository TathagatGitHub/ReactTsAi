import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Agent2Page from "./pages/Agent2Page";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agent2/:threadId" element={<Agent2Page />} />
      </Routes>
    </BrowserRouter>

  </StrictMode>,
)
