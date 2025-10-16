// MLForm.js

import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Box, TextField, Button, CircularProgress, Select, MenuItem, InputLabel, 
  FormControl, Typography, Stepper, Step, StepLabel, Stack, FormHelperText 
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion, AnimatePresence } from 'framer-motion';

// This object defines the valid input ranges. These MUST match the ranges used to train the model.
const foodInputProfiles = {
    'Cooked Rice': { temp: { min: 1, max: 40 }, moisture: { min: 65, max: 80 }, gas: { min: 50, max: 1000 } },
    'Milk': { temp: { min: 1, max: 30 }, moisture: { min: 85, max: 95 }, gas: { min: 50, max: 1200 } },
    'Sliced Bread': { temp: { min: 18, max: 30 }, moisture: { min: 35, max: 60 }, gas: { min: 20, max: 800 } },
    'Tomatoes': { temp: { min: 10, max: 30 }, moisture: { min: 90, max: 95 }, gas: { min: 100, max: 1500 } },
    'Leafy Greens': { temp: { min: 1, max: 25 }, moisture: { min: 85, max: 96 }, gas: { min: 80, max: 1300 } },
    'Chicken (Cooked)': { temp: { min: 1, max: 40 }, moisture: { min: 60, max: 75 }, gas: { min: 100, max: 2000 } },
    'Lentils (Cooked)': { temp: { min: 1, max: 40 }, moisture: { min: 68, max: 80 }, gas: { min: 50, max: 1100 } },
    'Paneer': { temp: { min: 2, max: 30 }, moisture: { min: 55, max: 70 }, gas: { min: 70, max: 1400 } },
    'Apples': { temp: { min: 0, max: 25 }, moisture: { min: 80, max: 90 }, gas: { min: 150, max: 1800 } },
    'Potatoes': { temp: { min: 7, max: 25 }, moisture: { min: 75, max: 90 }, gas: { min: 40, max: 900 } }
};
const foodItems = Object.keys(foodInputProfiles);

function MLForm({ onAnalysisComplete, startLoading }) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Food', 'Enter Readings'];

  const [formData, setFormData] = useState({
    foodType: '',
    temperature: '',
    moisture: '',
    gas: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Memoize the ranges to avoid recalculation on every render.
  const currentProfile = useMemo(() => 
    formData.foodType ? foodInputProfiles[formData.foodType] : null
  , [formData.foodType]);

  // Centralized validation function
  const validateField = (name, value, profile) => {
    if (String(value).trim() === '') return 'This field is required.';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Please enter a valid number.';

    if (!profile) return ''; // Cannot validate without a profile

    switch (name) {
      case 'temperature':
        return (numValue < profile.temp.min || numValue > profile.temp.max)
          ? `Range: ${profile.temp.min}°C to ${profile.temp.max}°C.` : '';
      case 'moisture':
        return (numValue < profile.moisture.min || numValue > profile.moisture.max)
          ? `Range: ${profile.moisture.min}% to ${profile.moisture.max}%.` : '';
      case 'gas':
        return (numValue < profile.gas.min || numValue > profile.gas.max)
          ? `Range: ${profile.gas.min} to ${profile.gas.max} ppm.` : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // When food type changes, clear old errors and values
    if (name === 'foodType') {
      setErrors({});
      setFormData(prev => ({ ...prev, temperature: '', moisture: '', gas: '' }));
    }
  };
  
  // This memo checks if the current step (the sensor readings) is valid
  const isStep1Valid = useMemo(() => {
    if (!currentProfile) return false;
    const tempErr = validateField('temperature', formData.temperature, currentProfile);
    const moistureErr = validateField('moisture', formData.moisture, currentProfile);
    const gasErr = validateField('gas', formData.gas, currentProfile);
    return !tempErr && !moistureErr && !gasErr;
  }, [formData, currentProfile]);

  const handleNext = () => {
    if (!formData.foodType) {
      setErrors({ foodType: 'Please select a food type.' });
      return;
    }
    setErrors({});
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Re-validate all fields before submitting
    const tempErr = validateField('temperature', formData.temperature, currentProfile);
    const moistureErr = validateField('moisture', formData.moisture, currentProfile);
    const gasErr = validateField('gas', formData.gas, currentProfile);
    
    const currentErrors = { temperature: tempErr, moisture: moistureErr, gas: gasErr };
    setErrors(currentErrors);

    if (Object.values(currentErrors).some(err => err !== '')) return;
    
    setIsLoading(true);
    if (typeof startLoading === 'function') startLoading();

    try {
      const payload = {
        food_type: formData.foodType,
        temperature: parseFloat(formData.temperature),
        moisture: parseFloat(formData.moisture),
        gas: parseFloat(formData.gas)
      };
      const response = await axios.post('http://127.0.0.1:5000/api/predict', payload);
      onAnalysisComplete(response.data);
    } catch (err) {
      console.error(err);
      onAnalysisComplete({ error: 'Failed to get a prediction. Please check the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
        {/* ... The rest of the JSX is mostly the same but with updated logic ... */}
        <Stack spacing={2}>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Analyze Your Food</Typography>
            <Typography color="text.secondary">Provide details to predict spoilage.</Typography>
        </Box>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 2, pb: 1 }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <Box sx={{ minHeight: 280, position: 'relative' }}>
            <AnimatePresence mode="wait">
            {activeStep === 0 && (
                <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <Stack spacing={2} pt={2}>
                    <FormControl fullWidth required error={!!errors.foodType}>
                    <InputLabel>Food Type</InputLabel>
                    <Select name="foodType" value={formData.foodType} label="Food Type" onChange={handleChange}>
                        {foodItems.map((food) => <MenuItem key={food} value={food}>{food}</MenuItem>)}
                    </Select>
                    {errors.foodType && <FormHelperText>{errors.foodType}</FormHelperText>}
                    </FormControl>
                </Stack>
                </motion.div>
            )}
            {activeStep === 1 && (
                <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <Stack spacing={2.5} pt={2}>
                    <TextField label="Temperature (°C)" type="number" name="temperature" value={formData.temperature} onChange={handleChange} required fullWidth error={!!errors.temperature} helperText={errors.temperature || (currentProfile ? `Range: ${currentProfile.temp.min}°C to ${currentProfile.temp.max}°C` : '')} InputProps={{ startAdornment: <ThermostatIcon color="action" sx={{ mr: 1 }} /> }} />
                    <TextField label="Moisture (%)" type="number" name="moisture" value={formData.moisture} onChange={handleChange} required fullWidth error={!!errors.moisture} helperText={errors.moisture || (currentProfile ? `Range: ${currentProfile.moisture.min}% to ${currentProfile.moisture.max}%` : '')} InputProps={{ startAdornment: <WaterDropIcon color="action" sx={{ mr: 1 }} /> }} />
                    <TextField label="Gas Value (ppm)" type="number" name="gas" value={formData.gas} onChange={handleChange} required fullWidth error={!!errors.gas} helperText={errors.gas || (currentProfile ? `Range: ${currentProfile.gas.min} to ${currentProfile.gas.max} ppm` : '')} InputProps={{ startAdornment: <AirIcon color="action" sx={{ mr: 1 }} /> }} />
                </Stack>
                </motion.div>
            )}
            </AnimatePresence>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: activeStep === 0 ? 'flex-end' : 'space-between', alignItems: 'center', pt: 2 }}>
            {activeStep === 1 && <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="text">Back</Button>}
            {activeStep === 0 && <Button variant="contained" onClick={handleNext}>Next</Button>}
            {activeStep === 1 && <Button type="submit" variant="contained" color="primary" disabled={isLoading || !isStep1Valid} size="large" sx={{ borderRadius: '50px', px: 4, py: 1.5, fontWeight: 600 }}>{isLoading ? <CircularProgress size={24} color="inherit" /> : 'Analyze & Predict'}</Button>}
        </Box>
        </Stack>
    </Box>
  );
}

export default MLForm;
