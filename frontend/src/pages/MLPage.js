// frontend/src/pages/MLPage.js

import React from 'react';
import MLForm from '../components/MLForm';
// --- FIX: All imports are now grouped at the top ---
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

function MLPage() {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="stretch">
          {/* Left Side: The Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Food Suitability Analyzer
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Fill in the sensor data for your surplus food. Our AI will predict its remaining shelf life to determine if it's suitable for donation.
              </Typography>
              <MLForm />
            </Paper>
          </Grid>
          
          {/* Right Side: Tips and Notes */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'primary.light', height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" />
                Input Guidelines
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    primary="Temperature (°C)" 
                    secondary={
                      <>
                        Enter the current storage temperature of the food.
                        <br />
                        <strong>Example:</strong> A refrigerator is <strong>4°C</strong>. Room temperature is <strong>20-25°C</strong>.
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    primary="Moisture (%)" 
                    secondary={
                      <>
                        Represents the relative humidity of the storage area.
                        <br />
                        <strong>Typical Range:</strong> Most environments are between <strong>40%</strong> and <strong>80%</strong>.
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    primary="Gas Value (ppm)" 
                    secondary={
                      <>
                        Measures gases released during decay (e.g., ethylene).
                        <br />
                        <strong>Note:</strong> Fresh items have low values (<strong>~100-200</strong>). High values (<strong>400+</strong>) suggest spoilage.
                      </>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MLPage;