import { Box, Container, Grid, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper', 
        py: { xs: 6, md: 8 }, 
        borderTop: '1px solid', 
        borderColor: 'divider', 
        mt: 'auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 5 }}>
          {/* Logo and Brand tagline */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <Box 
                sx={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '8px', 
                  bgcolor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'primary.contrastText',
                  boxShadow: '0 4px 10px rgba(184, 138, 90, 0.2)'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>R</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.3px', fontSize: '1.15rem' }}>
                RecoverAI
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '280px', lineHeight: 1.7 }}>
              The modern platform for recovering lost belongings using advanced computer vision and secure matching.
            </Typography>
          </Grid>

          {/* Links Column 1 */}
          <Grid item xs={6} sm={4} md={2.6}>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.primary', mb: 2.5, fontWeight: 700 }}>
              Product
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.75}>
              <MuiLink component={Link} to="/items" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Browse registry
              </MuiLink>
              <MuiLink component={Link} to="/items/report" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Report lost item
              </MuiLink>
              <MuiLink component={Link} to="/qr/scan" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Scan QR tag
              </MuiLink>
            </Box>
          </Grid>

          {/* Links Column 2 */}
          <Grid item xs={6} sm={4} md={2.6}>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.primary', mb: 2.5, fontWeight: 700 }}>
              Platform
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.75}>
              <MuiLink href="#" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                API integration
              </MuiLink>
              <MuiLink href="#" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Security protocols
              </MuiLink>
              <MuiLink href="#" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Status page
              </MuiLink>
            </Box>
          </Grid>

          {/* Links Column 3 */}
          <Grid item xs={12} sm={4} md={2.8}>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.primary', mb: 2.5, fontWeight: 700 }}>
              Legal
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.75}>
              <MuiLink href="#" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Privacy policy
              </MuiLink>
              <MuiLink href="#" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Terms of service
              </MuiLink>
              <MuiLink href="#" color="text.secondary" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                Security disclosure
              </MuiLink>
            </Box>
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            mt: { xs: 6, md: 7 }, 
            pt: 4, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            © {new Date().getFullYear()} RecoverAI. Designed for seamless returns.
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
            Built with computer vision and security.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
