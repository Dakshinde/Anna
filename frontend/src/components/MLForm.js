// frontend/src/components/MLForm.js

import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, CircularProgress, Paper, Select, MenuItem, InputLabel, FormControl, Container } from '@mui/material';

function MLForm() {
  // State for each input field
  const [foodType, setFoodType] = useState('');
  const [temperature, setTemperature] = useState('');
  const [moisture, setMoisture] = useState('');
  const [gas, setGas] = useState('');
  
  // State for API response
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      // Send a POST request to our new Flask API endpoint
      const response = await axios.post('http://127.0.0.1:5000/api/predict', {
        food_type: foodType,
        temperature: temperature,
        moisture: moisture,
        gas: gas
      });
      setResult(response.data); // Store the entire result object
    } catch (err) {
      setError('Failed to get a prediction. Please check the inputs or server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Check Food Suitability
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Enter sensor data about your surplus food to predict its shelf life.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth required>
              <InputLabel id="food-type-label">Food Type</InputLabel>
              <Select
                labelId="food-type-label"
                value={foodType}
                label="Food Type"
                onChange={(e) => setFoodType(e.target.value)}
              >
                <MenuItem value="Rice">Rice</MenuItem>
                <MenuItem value="Milk">Milk</MenuItem>
                <MenuItem value="Bread">Bread</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Meat">Meat</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Temperature (°C)"
              variant="outlined"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
            />
            <TextField
              label="Moisture (%)"
              variant="outlined"
              type="number"
              value={moisture}
              onChange={(e) => setMoisture(e.target.value)}
              required
            />
            <TextField
              label="Gas Value (ppm)"
              variant="outlined"
              type="number"
              value={gas}
              onChange={(e) => setGas(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ 
                backgroundColor: '#2E7D32',
                '&:hover': { backgroundColor: '#1B5E20' },
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Predict Shelf Life'}
            </Button>
          </Box>
        </form>

        {/* Display the result in a styled box */}
        {result && (
          <Box sx={{ mt: 4, p: 2, backgroundColor: '#E8F5E9', borderRadius: 2, textAlign: 'left' }}>
            <Typography variant="h6" sx={{ color: '#1B5E20' }}>Prediction Result:</Typography>
            <Typography variant="body1"><strong>Food Type:</strong> {result.food_type}</Typography>
            <Typography variant="body1"><strong>Status:</strong> {result.prediction}</Typography>
            <Typography variant="body1"><strong>Estimated Time to Spoil:</strong> {result.days_remaining} days</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ mt: 4, p: 2, backgroundColor: '#FFEBEE', borderRadius: 2 }}>
            <Typography variant="body1" color="error">{error}</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default MLForm;