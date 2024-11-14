// LoadingOverlay.js
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingOverlay;
