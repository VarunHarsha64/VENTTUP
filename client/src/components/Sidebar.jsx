import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Avatar, Typography, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 240;

const Sidebar = ({ profileName, profileRole, menuItems }) => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
    }}
  >
    <Toolbar />
    <Box sx={{ overflow: 'auto', textAlign: 'center', p: 2 }}>
      {/* Profile Section */}
      <Avatar sx={{ width: 80, height: 80, margin: '0 auto' }}>
        <AccountCircleIcon fontSize="large" />
      </Avatar>
      <Typography variant="h6" sx={{ mt: 1 }}>{profileName}</Typography>
      <Typography variant="body2" color="text.secondary">{profileRole}</Typography>
      <Divider sx={{ my: 2 }} />
      {/* Sidebar Menu Items */}
      <List>
        {menuItems.map((item) => (
          <ListItem  key={item.text} disablePadding>
            <ListItemButton onClick={item.action}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  </Drawer>
);

export default Sidebar;
