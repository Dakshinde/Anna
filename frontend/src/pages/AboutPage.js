// frontend/src/pages/AboutPage.js
import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import GroupIcon from '@mui/icons-material/Group';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Updated team member names
const teamMembers = [
  { name: 'Daksh Shinde', role: 'Leader' },
  { name: 'Parth Shelar', role: 'Member' },
  { name: 'Rishita Singh', role: 'Member' },
  { name: 'Shivam Singh', role: 'Member' },
];

const projectLead = teamMembers[0];
const otherMembers = teamMembers.slice(1);

function AboutPage() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Hero Section */}
      <Box sx={{ background: theme.palette.heroGradient, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center', animation: `${fadeInUp} 0.8s ease-out` }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
            About Anna Sampada
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '750px', margin: 'auto' }}>
            We are a passionate team dedicated to leveraging technology to combat food waste and hunger.
          </Typography>
        </Container>
      </Box>

      {/* Our Story Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
              Our Story
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 2 }}>
              Anna Sampada was born from a simple observation: while a significant amount of food goes to waste, many people in our communities face food insecurity. We saw an opportunity to bridge this gap using technology.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              Our project started as a college initiative, driven by a shared desire to create a tangible, positive impact. We combined our skills in machine learning, web development, and design to build a platform that is not only functional but also user-friendly and accessible to everyone.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src="/namedLogo.png"
              alt="Anna Sampada Logo large"
              sx={{
                maxWidth: '70%',
                height: 'auto',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                borderRadius: '50px',
                background: '(rgba(52, 232, 115, 1))', 
                marginLeft : "275px"
              }}
            />
          </Grid>
        </Grid>
      </Container>
      
      {/* Mission and Vision Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, background: 'transparent' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrackChangesIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>Our Mission</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  To create a sustainable ecosystem where surplus food is efficiently redirected from waste streams to those in need, using intelligent prediction and seamless connectivity.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, background: 'transparent' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VisibilityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>Our Vision</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  A future where technology eliminates food waste, ensuring that every edible item nourishes a life, contributing to a hunger-free and environmentally conscious world.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Meet the Team Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: 'primary.main' }}>
          Meet the Team
        </Typography>
        {/* Project Lead Row */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={12} sm={8} md={4}>
             <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  borderColor: theme.palette.divider,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Avatar sx={{ width: 80, height: 80, m: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                  <GroupIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{projectLead.name}</Typography>
                <Typography color="text.secondary">{projectLead.role}</Typography>
              </Paper>
          </Grid>
        </Grid>
        {/* Other Team Members Row */}
        <Grid container spacing={4} justifyContent="center">
          {otherMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  borderColor: theme.palette.divider,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Avatar sx={{ width: 80, height: 80, m: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                  <GroupIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{member.name}</Typography>
                <Typography color="text.secondary">{member.role}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default AboutPage;