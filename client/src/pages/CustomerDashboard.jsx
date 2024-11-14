import React, { useState, useEffect } from "react";
import { Box, CssBaseline, AppBar, Toolbar, Typography, Badge } from "@mui/material";
import Sidebar from "../components/Sidebar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import HistoryIcon from "@mui/icons-material/History";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PaymentIcon from "@mui/icons-material/Payment";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import toast from "react-hot-toast";

export default function CustomerDashboard() {
  console.log("rendering customer dashboard");
  const navigate = useNavigate();
  const { logout, userDetails } = useUserContext();
  const [orders, setOrders] = useState([]);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = jwtDecode(userDetails.token).id;
        const response = await axios.get(
          `http://localhost:3000/api/orders/fetchDispatchedOrders?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${userDetails.token}` },
          }
        );
        setOrders(response.data);
      } catch (err) {
        toast.error("Unable to fetch orders");
      }
    };
    fetchOrders();
  }, [userDetails.token]);

  const handleLogout = () => {
    logout();
  };

  const customerMenuItems = [
    { text: "Place Order", icon: <ShoppingCartIcon />, action: () => navigate("/dashboard/place-order") },
    { text: "Track Order", icon: <TrackChangesIcon />, action: () => navigate("/dashboard/track-order") },
    {
      text: "Payment",
      icon: (
        <Badge
          color="error"
          variant="dot"
          invisible={orders.length === 0}
        >
          <PaymentIcon />
        </Badge>
      ),
      action: () => navigate("/dashboard/customer-payment"),
    },
    { text: "Order History", icon: <HistoryIcon />, action: () => navigate("/dashboard/customer-order-history") },
    { text: "Logout", icon: <ExitToAppIcon />, action: () => handleLogout() },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            VENTTUP
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar
        profileName="Rohit Kannan"
        profileRole="Customer"
        menuItems={customerMenuItems}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Customer Dashboard Content */}
        <Outlet />
      </Box>
    </Box>
  );
}
