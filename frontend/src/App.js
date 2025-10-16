// frontend/src/App.js
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProviderWrapper } from './theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MLPage from './pages/MLPage';
import NgoPage from './pages/NgoPage';
import AboutPage from './pages/AboutPage'; // Import the new About Page
import Footer from './components/Footer'; // Import the new Footer component


function ThemedApp({ theme }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/predict" element={<MLPage />} />
              <Route path="/NGOs" element={<NgoPage />} />  
              <Route path="/about" element={<AboutPage />} /> {/* Add route for About Page */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProviderWrapper>
      {(theme) => <ThemedApp theme={theme} />}
    </ThemeProviderWrapper>
  );
}