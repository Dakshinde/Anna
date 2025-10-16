import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Container, Paper, Grid, Fade,
  TextField, Button, CircularProgress, Select, MenuItem, InputLabel,
  FormControl, Stepper, Step, StepLabel, Stack, FormHelperText, LinearProgress,
  Modal, IconButton
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Component 1: ResultsDisplay
// Updated to handle button clicks and trigger parent functions.
// ============================================================================
const maxShelfLife = {
    'Cooked Rice': 4, 'Milk': 7, 'Sliced Bread': 7, 'Tomatoes': 14, 
    'Leafy Greens': 10, 'Chicken (Cooked)': 4, 'Lentils (Cooked)': 4, 
    'Paneer': 7, 'Apples': 120, 'Potatoes': 60
};

function ResultsDisplay({ 
  loading = false, 
  predictionData = null,
  onLearnDisposal,
  onFindRecipes,
  onDonate
}) {
  if (!loading && !predictionData) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Your food analysis will appear here</Typography>
          <Typography color="text.secondary">Enter sensor readings to see the result.</Typography>
        </Box>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 360 }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
            <Typography variant="h6" sx={{fontWeight: 700}}>Analyzing...</Typography>
            <LinearProgress sx={{ height: 10, borderRadius: 5 }} />
            <Box sx={{flex: 1}}/>
            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center'}}>Processing sensor data...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (predictionData?.error) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 56, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Analysis Failed</Typography>
          <Typography color="text.secondary">{predictionData.error}</Typography>
        </Box>
      </Paper>
    );
  }

  const isSpoiled = predictionData.prediction === 1;
  const daysRemaining = predictionData.days_remaining ?? 0;
  const foodType = predictionData.food_type;
  const maxDays = foodType ? maxShelfLife[foodType] || 7 : 7;
  const percentRemaining = Math.max(0, Math.min(100, (daysRemaining / maxDays) * 100));

  return (
    <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, height: 360, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isSpoiled ? <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 44 }} /> : <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 44 }} />}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: isSpoiled ? 'error.main' : 'success.main' }}>
            {predictionData.status || (isSpoiled ? 'Spoilage Detected' : 'Looks Good')}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
            Prediction for: {foodType || 'Unknown Food'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        {!isSpoiled ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Estimated Remaining Shelf Life</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{daysRemaining} days</Typography>
            </Box>
            <LinearProgress variant="determinate" value={percentRemaining} sx={{ height: 14, borderRadius: 8, bgcolor: 'divider' }} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              This food appears fresh. Please consider donating if you won't use it.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Recommendation:
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Based on the sensor data, this food is likely spoiled. Please dispose of it safely. Do not consume or donate.
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {!isSpoiled ? (
          <>
            <Button variant="outlined" color="primary" sx={{ borderRadius: 2, px: 3, py: 1 }} onClick={() => onFindRecipes(foodType)}>
              Find Leftover Recipes
            </Button>
            <Button variant="contained" color="success" sx={{ borderRadius: 2, px: 3, py: 1 }} onClick={onDonate}>
              Donate Now
            </Button>
          </>
        ) : (
          <Button variant="outlined" color="error" sx={{ borderRadius: 2, px: 3, py: 1 }} onClick={() => onLearnDisposal(foodType)}>
            Learn Safe Disposal
          </Button>
        )}
      </Box>
    </Paper>
  );
}

// ============================================================================
// Component 2: MLForm (No changes needed)
// ============================================================================
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
  const [formData, setFormData] = useState({ foodType: '', temperature: '', moisture: '', gas: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const currentProfile = useMemo(() => formData.foodType ? foodInputProfiles[formData.foodType] : null, [formData.foodType]);

  const validateField = (name, value, profile) => {
    if (String(value).trim() === '') return 'This field is required.';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Please enter a valid number.';
    if (!profile) return '';
    switch (name) {
      case 'temperature': return (numValue < profile.temp.min || numValue > profile.temp.max) ? `Range: ${profile.temp.min}°C to ${profile.temp.max}°C.` : '';
      case 'moisture': return (numValue < profile.moisture.min || numValue > profile.moisture.max) ? `Range: ${profile.moisture.min}% to ${profile.moisture.max}%.` : '';
      case 'gas': return (numValue < profile.gas.min || numValue > profile.gas.max) ? `Range: ${profile.gas.min} to ${profile.gas.max} ppm.` : '';
      default: return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'foodType') {
      setErrors({});
      setFormData(prev => ({ ...prev, foodType: value, temperature: '', moisture: '', gas: '' }));
    } else {
      const error = validateField(name, value, currentProfile);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  const isStep1Valid = useMemo(() => {
    if (!currentProfile) return false;
    return !validateField('temperature', formData.temperature, currentProfile) && !validateField('moisture', formData.moisture, currentProfile) && !validateField('gas', formData.gas, currentProfile);
  }, [formData, currentProfile]);

  const handleNext = () => {
    if (!formData.foodType) { setErrors({ foodType: 'Please select a food type.' }); return; }
    setErrors({});
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    
    setIsLoading(true);
    if (typeof startLoading === 'function') startLoading();

    try {
      const payload = { food_type: formData.foodType, temperature: parseFloat(formData.temperature), moisture: parseFloat(formData.moisture), gas: parseFloat(formData.gas) };
      const response = await axios.post('http://127.0.0.1:5000/api/predict', payload);
      onAnalysisComplete(response.data);
    } catch (err) {
      console.error(err);
      onAnalysisComplete({ error: 'Failed to get a prediction. Please check the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 } };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
        <Stack spacing={2}>
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

// ============================================================================
// Main Page Component
// Now with state management for the chatbot modal.
// ============================================================================
export default function MLPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW STATE FOR CHATBOT ---
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState({ command: '', context: '' });

  const handleAnalysisComplete = (data) => {
    setIsLoading(false);
    setResult(data);
  };

  const handleStartLoading = () => {
    setIsLoading(true);
    setResult(null);
  };

  // --- NEW HANDLER FUNCTIONS ---
  const handleOpenChatbot = (command, context) => {
    setChatbotQuery({ command, context });
    setChatbotOpen(true);
    // Here you would typically have your chatbot component make the API call.
    console.log(`Opening chatbot with command: ${command}, context: ${context}`);
  };

  const handleDonate = () => {
    // This would navigate to your NGO page or open a donation modal.
    console.log("Donate button clicked! Should navigate to NGO page.");
    alert("This would take you to the NGO donation page!");
  };

  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 88px)',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #fce4ec 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: '20px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.1)' }}>
          <Grid container spacing={{xs: 2, md: 4}} alignItems="stretch">
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Check Food Suitability</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Enter sensor data to predict your food's shelf life.</Typography>
                <MLForm onAnalysisComplete={handleAnalysisComplete} startLoading={handleStartLoading} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <Fade in={isLoading || Boolean(result)} timeout={400}>
                  <div>
                    <ResultsDisplay 
                      loading={isLoading} 
                      predictionData={result}
                      // --- Pass handlers down to the results component ---
                      onLearnDisposal={(foodType) => handleOpenChatbot('GET_FOOD_SAFETY_TIPS', foodType)}
                      onFindRecipes={(foodType) => handleOpenChatbot('GET_LEFTOVER_RECIPES', foodType)}
                      onDonate={handleDonate}
                    />
                  </div>
                </Fade>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* --- CHATBOT PLACEHOLDER MODAL --- */}
      <Modal
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      >
        <Paper sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <IconButton onClick={() => setChatbotOpen(false)} sx={{position: 'absolute', top: 8, right: 8}}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2">
            Chatbot Query
          </Typography>
          <Typography sx={{ mt: 2 }}>
            <strong>Command:</strong> {chatbotQuery.command}
          </Typography>
          <Typography>
            <strong>For Food:</strong> {chatbotQuery.context}
          </Typography>
          <Typography sx={{ mt: 2, fontStyle: 'italic' }}>
            (This is a placeholder. Your real chatbot UI would go here and make an API call with this data.)
          </Typography>
        </Paper>
      </Modal>

    </Box>
  );
}

