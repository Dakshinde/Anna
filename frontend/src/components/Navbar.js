// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme, IconButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { keyframes } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';
import ScienceIcon from '@mui/icons-material/Science';
import InfoIcon from '@mui/icons-material/Info';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '../theme';

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

function Navbar() {
  const location = useLocation();
  const theme = useTheme();
  const { toggleColorMode } = useThemeContext();
  const [hoveredButton, setHoveredButton] = useState(null);

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { path: '/predict', label: 'Predict', icon: <ScienceIcon sx={{ fontSize: 20 }} /> },
    { path: '/about', label: 'About Us', icon: <InfoIcon sx={{ fontSize: 20 }} /> },
    { path: '/NGOs', label: 'NGOs', icon: <InfoIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: theme.palette.background.paper,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 2px 20px rgba(0, 0, 0, ${theme.palette.mode === 'dark' ? 0.2 : 0.05})`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        animation: `${slideDown} 0.5s ease-out`,
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ '&:hover': { transform: 'scale(1.05)' }, transition: 'transform 0.3s ease' }}>
            <img src="/annalogo.jpg" alt="Anna Sampada Logo" style={{ height: '48px', marginRight: '16px', borderRadius: '20px' }} />
          </Box>
          <Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #2e7d32 0%, #00897b 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Anna Sampada
              </Typography>
          </Box>
        </Link>
        
        <div style={{ flexGrow: 1 }}></div>
        
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isAnyButtonHovered = hoveredButton !== null;
            const isThisButtonHovered = hoveredButton === index;

            return (
              <Button 
                key={item.path}
                component={Link} 
                to={item.path}
                onMouseEnter={() => setHoveredButton(index)}
                onMouseLeave={() => setHoveredButton(null)}
                startIcon={item.icon}
                sx={{
                  color: isActive ? 'white' : 'text.primary',
                  fontWeight: 600,
                  px: 3, py: 1,
                  borderRadius: '25px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: isActive ? 'linear-gradient(135deg, #43a047 0%, #00897b 100%)' : 'transparent',
                  transition: 'all 0.3s ease',
                  opacity: isAnyButtonHovered && !isThisButtonHovered ? 0.7 : 1,
                  transform: isThisButtonHovered ? 'translateY(-2px)' : 'none',
                  '&:hover': {
                    background: isActive ? 'linear-gradient(135deg, #388e3c 0%, #00796b 100%)' : theme.palette.action.hover,
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
          <IconButton onClick={toggleColorMode} color="inherit" sx={{ color: 'text.primary' }}>
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;