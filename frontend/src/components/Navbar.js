// frontend/src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom'; // Import Link

function Navbar() {
  return (
    <AppBar position="static" style={{ background: '#FFFFFF', color: '#333333', boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Anna Sampada Logo" style={{ height: '40px', marginRight: '15px' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Anna Sampada
          </Typography>
        </Link>
        <div style={{ flexGrow: 1 }}></div> {/* This pushes the buttons to the right */}
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/predict">Predict</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;