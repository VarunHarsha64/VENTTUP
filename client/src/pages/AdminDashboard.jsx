import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, accordionActionsClasses } from '@mui/material';
import Sidebar from '../components/Sidebar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StatusIcon from '@mui/icons-material/Autorenew';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CategoryIcon from '@mui/icons-material/Category';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';


export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useUserContext();

  const adminMenuItems = [
    { text: 'Vendor Assignment + Approval', icon: <AssignmentIcon />, action: ()=> navigate('/dashboard/approveOrder-assignVendor') },
    { text: 'Active Order Status', icon: <StatusIcon />, action: ()=> navigate('/dashboard/active-order-status')},
    { text: 'User Management', icon: <PeopleIcon /> , action: ()=> navigate('/dashboard/user-management')},
    // { text: 'Reports & Analytics', icon: <AnalyticsIcon /> },    
    { text: 'Add Items', icon: <CategoryIcon/>, action: ()=> handleViewAndAddItems()},
    { text: 'Order History', icon: <HistoryIcon />, action: ()=> navigate('/dashboard/admin-order-history')},
    { text: 'Logout', icon: <ExitToAppIcon />, action: () => handleLogout() },
  ];

  const handleViewAndAddItems = () => {
    navigate('/dashboard/view-add-items')
  }
  
  const handleLogout = () =>{
    logout();
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            VENTTUP
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar profileName="Admin User" profileRole="Administrator" menuItems={adminMenuItems} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Admin Dashboard Content */}
        <Outlet />
      </Box>
    </Box>
  );
}
