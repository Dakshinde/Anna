// frontend/src/pages/NgoPage.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Typography, Container, CircularProgress, Paper, Modal, Box, TextField, Button } from '@mui/material';
import L from 'leaflet';
import axios from 'axios';

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 25],
});

// Style for the popup modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

function NgoPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the donation form modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [formDetails, setFormDetails] = useState({ foodDetails: '', address: '', contact: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        fetchNgos(latitude, longitude);
      },
      () => {
        const fallbackLat = 19.29;
        const fallbackLng = 72.85;
        setUserLocation([fallbackLat, fallbackLng]);
        fetchNgos(fallbackLat, fallbackLng);
        setError("Could not access your location. Showing results for Mira Bhayandar.");
      }
    );
  }, []);

  const fetchNgos = async (lat, lng) => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/get-ngos', { params: { lat, lng } });
      setNgos(response.data);
    } catch (err) {
      setError("Failed to fetch nearby NGOs.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for the Donation Modal ---
  const handleOpenModal = (ngo) => {
    setSelectedNgo(ngo);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNgo(null);
    setFormDetails({ foodDetails: '', address: '', contact: '' }); // Reset form
  };

  const handleFormChange = (e) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    if (!selectedNgo) return;
    setIsSubmitting(true);

    try {
      await axios.post('http://127.0.0.1:5000/api/notify-ngo', {
        ngo: selectedNgo,
        formDetails: formDetails
      });
      alert('Success! The NGO has been notified.');
      handleCloseModal();
    } catch (error) {
      console.error('Donation submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userLocation) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography>Finding your location...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">Find Nearby NGOs</Typography>
      {error && <Typography color="error" align="center">{error}</Typography>}
      
      <Paper elevation={4} sx={{ height: '60vh', width: '100%', borderRadius: 2, overflow: 'hidden', mt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Searching...</Typography></Box>
        ) : (
          <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <Marker position={userLocation} icon={userIcon}><Popup>You are here</Popup></Marker>
            
            {ngos.map(ngo => (
              <Marker key={ngo.id} position={ngo.location}>
                <Popup>
                  <Typography variant="h6" component="div">{ngo.name}</Typography>
                  <Typography variant="body2">{ngo.address}</Typography>
                  <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={() => handleOpenModal(ngo)}>
                    Notify for Donation
                  </Button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </Paper>

      {/* --- The Donation Form Modal --- */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleSubmitDonation}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Notify {selectedNgo?.name}
          </Typography>
          <TextField name="foodDetails" label="Food Details (e.g., Cooked Rice, for 10 people)" required fullWidth margin="normal" onChange={handleFormChange} />
          <TextField name="address" label="Pickup Address" required fullWidth margin="normal" onChange={handleFormChange} />
          <TextField name="contact" label="Your Contact Number" required fullWidth margin="normal" onChange={handleFormChange} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Send Notification"}
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}

export default NgoPage;