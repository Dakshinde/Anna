// frontend/src/pages/HomePage.js
import React from 'react';
import { Box, Typography, Container, Button, Grid, Paper, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import ScienceIcon from '@mui/icons-material/Science';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { keyframes } from '@mui/system';
import ChatbotComponent from '../components/ChatbotComponent';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

function HomePage() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      <Box sx={{ 
        background: theme.palette.heroGradient,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 10, md: 14 }}}>
          <Box
            component="img"
            src="/annalogo.jpg"
            alt="Anna Sampada Logo"
            sx={{
              height: { xs: '80px', md: '120px' },
              mb: 3,
              borderRadius: '50px',
              animation: `${fadeInUp} 0.6s ease-out`,
            }}
          />
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2e7d32 0%, #00897b 50%, #0277bd 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Turn Surplus Into Sustenance
          </Typography>
          <Typography variant="h5" sx={{ mb: 5, color: 'text.secondary', fontWeight: 400 }}>
            A bridge between your excess food and those who need it most
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/predict" 
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #43a047 0%, #00897b 100%)',
              color: 'white', px: 5, py: 1.5,
              fontWeight: 600, borderRadius: '50px',
            }}
          >
            Analyze Food Now
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          align="center" 
          sx={{ mb: 6, fontWeight: 700, color: 'primary.main' }}
        >
          Our Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { 
              icon: <ScienceIcon sx={{ fontSize: 60 }} />, 
              title: 'ML Prediction', 
              description: 'Use our AI to predict food shelf life accurately with advanced algorithms.',
              gradient: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
              delay: 0
            },
            { 
              icon: <VolunteerActivismIcon sx={{ fontSize: 60 }} />, 
              title: 'NGO Connect', 
              description: 'Find and notify nearby NGOs to donate surplus food seamlessly.',
              gradient: 'linear-gradient(135deg, #4db6ac 0%, #26a69a 100%)',
              delay: 0.1
            },
            { 
              icon: <FastfoodIcon sx={{ fontSize: 60 }} />, 
              title: 'Smart Recipes', 
              description: 'Get creative recipes for your leftovers to minimize waste effectively.',
              gradient: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
              delay: 0.2
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  height: '100%',
                  borderRadius: '20px',
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[10],
                  }
                }}
              >
                <Box sx={{ 
                  width: 100, height: 100, margin: '0 auto', mb: 2, borderRadius: '20px',
                  background: feature.gradient, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white',
                  animation: `${float} 3s ease-in-out infinite`,
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" sx={{ mt: 2, mb: 1.5, fontWeight: 700, color: 'primary.main' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      <ChatbotComponent />
    </Box>
  );
}

export default HomePage;