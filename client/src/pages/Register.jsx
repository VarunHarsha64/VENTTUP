import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import axios from 'axios';
import { useUserContext } from "../context/UserContext";
import { useNavigate, Link } from 'react-router-dom';
import toast from "react-hot-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer"); // Default role
  const [businessName, setBusinessName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const { login } = useUserContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post("https://venttup-api.onrender.com/api/users/register", { 
        businessName,
        username,
        password,
        phoneNo,
        role,
        address
      });
      toast.success("Registration successful!");
      navigate("/dashboard"); // Navigate to the dashboard
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={3}
        bgcolor="white"
        boxShadow={3}
        borderRadius={2}
        maxWidth={400}
        width="100%"
      >
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>

        <TextField
          label="Username"
          variant="outlined"
          margin="normal"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          margin="normal"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <TextField
          label="Business Name"
          variant="outlined"
          margin="normal"
          fullWidth
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <TextField
          label="Phone Number"
          variant="outlined"
          margin="normal"
          fullWidth
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
        />

        <TextField
          label="Address"
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            Role
          </FormLabel>
          <RadioGroup
            row
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ justifyContent: "center" }}
          >
            <FormControlLabel
              value="customer"
              control={<Radio />}
              label="Customer"
              sx={{ mr: 2 }}
            />
            <FormControlLabel
              value="vendor"
              control={<Radio />}
              label="Vendor"
            />
          </RadioGroup>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Register
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login">Login here</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
