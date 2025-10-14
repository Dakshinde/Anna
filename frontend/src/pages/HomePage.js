// frontend/src/pages/HomePage.js

import React, { useState } from 'react';
import { Box, Typography, Container, Button, Fab, Grid, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // CHANGED: Import useNavigate
import ChatIcon from '@mui/icons-material/Chat';
import ScienceIcon from '@mui/icons-material/Science';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ChatbotComponent from '../components/ChatbotComponent';

function HomePage() {
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate(); // CHANGED: Get the navigate function here

  return (
    <>
      {/* ... (Hero section and feature cards remain the same) ... */}
      <Box sx={{ bgcolor: 'primary.light', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Turn Surplus Into Sustenance.
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            A bridge between your excess food and those who need it most.
          </Typography>
          <Button variant="contained" component={Link} to="/predict" size="large">
            Analyze Food Now
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Feature Cards ... */}
          <Grid item xs={12} sm={6} md={4}><Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}><ScienceIcon color="primary" sx={{ fontSize: 50 }} /><Typography variant="h6" sx={{ mt: 2 }}>ML Prediction</Typography><Typography>Use our AI to predict food shelf life accurately.</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={4}><Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}><VolunteerActivismIcon color="primary" sx={{ fontSize: 50 }} /><Typography variant="h6" sx={{ mt: 2 }}>NGO Connect</Typography><Typography>Find and notify nearby NGOs to donate surplus food.</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={4}><Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}><FastfoodIcon color="primary" sx={{ fontSize: 50 }} /><Typography variant="h6" sx={{ mt: 2 }}>Smart Recipes</Typography><Typography>Get recipes for your leftovers to minimize waste.</Typography></Paper></Grid>
        </Grid>
      </Container>
      
      {/* --- Chatbot Section --- */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
        {/* CHANGED: Pass navigate as a prop */}
        {showChatbot && <div style={{ width: '350px' }}><ChatbotComponent navigate={navigate} /></div>}
        <Fab color="primary" onClick={() => setShowChatbot((prev) => !prev)} sx={{ mt: 2 }}>
          <ChatIcon />
        </Fab>
      </div>
    </>
  );
}

export default HomePage;