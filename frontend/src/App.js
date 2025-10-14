// frontend/src/App.js
import React from 'react';
// Import the router functionality from the library
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import our custom components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MLPage from './pages/MLPage';
import ChatbotComponent from './components/ChatbotComponent'; // Import the new chatbot

// Import global styles
import './App.css';

function App() {
  return (
    // The Router component must wrap your entire application
    <Router>
      <div className="App">
        {/* The Navbar is now inside the router */}
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/predict" element={<MLPage />} />
        </Routes>

        {/* This adds the new, beautiful chatbot to every page */}
        <ChatbotComponent />
      </div>
    </Router>
  );
}

export default App;