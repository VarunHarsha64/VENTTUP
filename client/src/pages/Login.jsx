import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import axios from 'axios';
import { useUserContext } from "../context/UserContext";
import { useNavigate, Link } from 'react-router-dom'; 
import toast from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useUserContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/users/login", { username, password });
      const { token, role, message } = response.data;

      if (message) {
        // If the message is related to verification, redirect to a page
        toast.error(message);
        navigate("/verification-pending", { state: { message } });
      } else {
        login(token, role); // Call context login
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" alignItems="center" p={3} bgcolor="white" boxShadow={3} borderRadius={2} maxWidth={400} width="100%">
        <Typography variant="h4" gutterBottom>Sign In</Typography>

        <TextField label="Username" variant="outlined" margin="normal" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField label="Password" type="password" variant="outlined" margin="normal" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Sign In</Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Don’t have an account? <Link to="/register">Register here</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
