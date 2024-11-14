import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Paper } from "@mui/material";
import { useUserContext } from "../context/UserContext";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const { userDetails, isLoading, setIsLoading } = useUserContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  // Fetch unverified users function
  const fetchUnverifiedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://venttup-api.onrender.com/api/users/unverifiedList", {
        headers: {
          Authorization: `Bearer ${userDetails.token}`,
        },
      });
      console.log(response.data);
      setUsers(response.data);
    } catch (err) {
      console.log("Unable to fetch", err);
      toast.error("Unable to fetch unverified users.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unverified users on component mount
  useEffect(() => {
    fetchUnverifiedUsers();
  }, [userDetails.token, isLoading]);

  // Handle user verification or decline
  const handleUserAction = async (userId, action) => {
    setIsLoading(true);
    try {
      await axios.post(
        `https://venttup-api.onrender.com/api/users/verifyUser`,
        { userId, action },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success(`User ${action}ed successfully!`);

      // Update the users list by filtering out the updated user
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));

    } catch (error) {
      console.error(`Failed to ${action} user`, error);
      toast.error(`Failed to ${action} user.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new vendor account creation
  const handleCreateVendor = async () => {
    setIsLoading(true);
    if (!username || !password || !businessName || !address || !phoneNo) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(
        `https://venttup-api.onrender.com/api/users/createVendor`,
        { username, password, businessName, address, phoneNo },
        {
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );
      toast.success("Vendor account created successfully!");
      setUsername("");
      setPassword("");
      setBusinessName("");
      setAddress("");
      setPhoneNo("");
    } catch (error) {
      console.error("Failed to create vendor account", error);
      toast.error("Failed to create vendor account.");
    } finally{
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Left Section: Unverified Users List */}
      <Box
        sx={{
          width: "40%",
          padding: 2,
          borderRight: "1px solid #ccc",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Unverified Users 
        </Typography>
        {users.length === 0 ? (
          <Typography>No unverified users found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {users.map((user) => (
              <Grid item xs={12} key={user._id}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    backgroundColor: "#e3f2fd",
                    padding: 1,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Business Name: {user.businessName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role: {user.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone Number: {user.phoneNo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Address: {user.address}
                    </Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUserAction(user._id, "verify")}
                    sx={{ m: 1 }}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleUserAction(user._id, "decline")}
                    sx={{ m: 1 }}
                  >
                    Decline
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Right Section: Admin Create Vendor Form */}
      <Box
        sx={{
          width: "60%",
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Create Vendor Account
          </Typography>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <TextField
            label="Business Name"
            variant="outlined"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <TextField
            label="Address"
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateVendor}
            sx={{ marginTop: 2 }}
          >
            Create Vendor
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserManagement;
