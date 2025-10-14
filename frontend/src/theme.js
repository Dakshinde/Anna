// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // A strong, accessible green
      light: '#E8F5E9', // The light green for backgrounds
    },
    secondary: {
      main: '#4CAF50',
    },
    background: {
      default: '#F9F9F9',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h2: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
  },
});

export default theme;