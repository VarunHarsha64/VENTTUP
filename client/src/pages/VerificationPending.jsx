import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const VerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      flexDirection="column"
    >
      <Box
        bgcolor="white"
        boxShadow={3}
        borderRadius={2}
        p={3}
        maxWidth={400}
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="h5" gutterBottom>
          Registration Pending Verification
        </Typography>
        <Typography variant="body1" gutterBottom>
          {message || "Your registration has not been verified by the admin yet. Kindly contact the admin or wait for approval."}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/login")}
          sx={{ mt: 2 }}
        >
          Go Back to Sign In
        </Button>
      </Box>
    </Box>
  );
};

export default VerificationPending;
