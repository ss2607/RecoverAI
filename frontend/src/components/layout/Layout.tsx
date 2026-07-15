import { type ReactNode, useContext } from 'react';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { NotificationToast } from './NotificationToast';
import { AuthContext } from '../../features/auth/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
        overflowX: 'hidden', // Prevent horizontal scrolling
        width: '100%',
      }}
    >
      {/* Dynamic, subtle intelligence bg mesh */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '600px',
          background: 'radial-gradient(circle at 50% 0%, rgba(184, 138, 90, 0.04) 0%, transparent 60%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '20vh',
          left: '-10%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, rgba(216, 195, 165, 0.02) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      
      {/* Sticky Navbar */}
      <Navbar />
      
      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          pt: { xs: 4, md: 6 }, // Uniform spacing beneath the sticky navbar
          pb: 6,
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
      
      {/* Footer - hidden on authenticated pages */}
      {!isAuthenticated && <Footer />}
      
      {/* Reusable Toast Notifications */}
      {isAuthenticated && <NotificationToast />}
    </Box>
  );
};
