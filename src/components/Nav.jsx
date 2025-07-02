// components/Nav.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Button,
  Divider,
} from '@mui/material';

const drawerWidth = 240;

const links = [
  { path: '/', label: 'Dashboard' },
  { path: '/profile', label: 'Profile' },
  { path: '/homemanager', label: 'Home Manager' },
  { path: '/restaurants', label: 'Restaurants' },
  { path: '/accommodation', label: 'Accommodation' },
  { path: '/recreation', label: 'Recreation' },
  { path: '/attraction', label: 'Attraction' },
  { path: '/emergency', label: 'Emergency' },
  { path: '/transport', label: 'Transport' },
  { path: '/business', label: 'Business' },
  { path: '/healthcare', label: 'Healthcare' },
  { path: '/publicservices', label: 'Public Services' },
  { path: '/xploremenu', label: 'Xplore Menu' },
];

const Nav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here (e.g., clearing tokens)
    console.log('Logging out...');
    navigate('/profile'); // Example: redirect to profile after logout
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#000',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Xplore
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#444' }} />

      <List>
        {links.map(({ path, label }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={path}
              sx={{
                color: '#fff',
                '&.active': {
                  backgroundColor: '#fff',
                  color: '#000',
                },
              }}
              end={path === '/'}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          sx={{
            backgroundColor: '#fff',
            color: '#000',
            '&:hover': {
              backgroundColor: '#ccc',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Nav;
