import React from "react";
import { Box, CssBaseline, AppBar, Toolbar, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import PendingIcon from "@mui/icons-material/AccessTime";
import ActiveIcon from "@mui/icons-material/Autorenew";
import HistoryIcon from "@mui/icons-material/History";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { logout } = useUserContext();

  const vendorMenuItems = [
    { text: "Pending Orders", icon: <PendingIcon /> , action: ()=> navigate('/dashboard/vendor-pending-order')},
    { text: "Active Orders", icon: <ActiveIcon />, action: ()=> navigate('/dashboard/vendor-active-order') },
    { text: "Order History", icon: <HistoryIcon />, action: ()=> navigate('/dashboard/vendor-order-history') },
    { text: "Logout", icon: <ExitToAppIcon />, action: () => handleLogout() },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            VENTTUP
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar
        profileName="Varun Harsha"
        profileRole="Vendor"
        menuItems={vendorMenuItems}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Vendor Dashboard Content */}
        <Outlet/>
      </Box>
    </Box>
  );
}
