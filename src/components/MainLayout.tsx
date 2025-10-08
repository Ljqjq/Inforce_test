import type { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inforce Shop
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="inherit"><Brightness4Icon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main">{children}</Box>
    </>
  );
}
