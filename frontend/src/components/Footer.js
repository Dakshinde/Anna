// frontend/src/components/Footer.js
import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, useTheme } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

function Footer() {
  const theme = useTheme();
  return (
    <Box 
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.secondary',
        py: 6,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto' // Pushes footer to the bottom
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-evenly">
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Anna Sampada
            </Typography>
            <Typography variant="body2">
              A bridge between your excess food and those who need it most. Reduce waste, reuse resources, and donate to make a difference.
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Links
            </Typography>
            <Link href="/" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none' }}>Home</Link>
            <Link href="/predict" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none' }}>Predict</Link>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" display="block">Mira Bhayandar, Maharashtra, India</Typography>
            <Typography variant="body2" display="block">contact@annasampada.com</Typography>
          </Grid>
          <Grid item xs={12} sm={3} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Follow Us
            </Typography>
            <IconButton href="#" color="inherit"><FacebookIcon /></IconButton>
            <IconButton href="#" color="inherit"><TwitterIcon /></IconButton>
            <IconButton href="#" color="inherit"><InstagramIcon /></IconButton>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' Anna Sampada. All Rights Reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;