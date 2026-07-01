import { Box, Button, Container, Grid, Typography, Card, CardContent, Avatar, Rating } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  QrCodeScannerOutlined as QrCodeScannerOutlinedIcon,
  VerifiedOutlined as VerifiedOutlinedIcon,
  NotificationsActiveOutlined as NotificationsActiveOutlinedIcon,
  ImageSearchOutlined as ImageSearchOutlinedIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

export const LandingPage = () => {
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }} className="fade-in">
      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: { xs: 12, md: 16 }, 
          pb: { xs: 10, md: 14 }, 
          position: 'relative',
          borderBottom: '1px solid',
          borderColor: 'rgba(139, 111, 71, 0.08)'
        }}
        className="grid-bg"
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box 
            sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 1, 
              px: 2, 
              py: 0.5, 
              borderRadius: '20px', 
              bgcolor: 'rgba(198, 162, 126, 0.1)', 
              color: 'secondary.main',
              mb: 4,
              border: '1px solid rgba(198, 162, 126, 0.2)'
            }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Introducing RecoverAI 2.0
            </Typography>
          </Box>
          
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.75rem' }, 
              fontWeight: 800,
              lineHeight: 1.1,
              mb: 3, 
              color: 'text.primary',
              maxWidth: '900px',
              mx: 'auto'
            }}
          >
            Find what's lost.<br/>Reunited in seconds by AI.
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 5, 
              fontWeight: 400, 
              maxWidth: '650px', 
              mx: 'auto', 
              fontSize: { xs: '1rem', md: '1.2rem' },
              lineHeight: 1.6
            }}
          >
            RecoverAI bridges the gap between lost belongings and their owners. Using advanced computer vision and secure verification matching, recovery is now absolute.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              component={Link} 
              to="/items/report" 
              variant="contained" 
              color="primary" 
              size="large" 
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 4, py: 1.8, fontSize: '1rem', fontWeight: 700 }}
            >
              Report Lost Item
            </Button>
            <Button 
              component={Link} 
              to="/items" 
              variant="outlined" 
              color="primary" 
              size="large" 
              sx={{ px: 4, py: 1.8, fontSize: '1rem', fontWeight: 700 }}
            >
              Browse Found Items
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box 
        sx={{ 
          py: 8, 
          bgcolor: '#FFFDF8', 
          borderBottom: '1px solid',
          borderColor: 'rgba(139, 111, 71, 0.08)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '3rem' }}>
                15,240+
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                Items Reunited
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '3rem' }}>
                99.4%
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                Match Accuracy
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '3rem' }}>
                45,000+
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mt: 1, letterSpacing: '0.1em' }}>
                Active Users
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              Intelligent Lost & Found Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Designed to take the anxiety out of lost items. Powered by premium search, matching logic, and secure protocols.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <ImageSearchOutlinedIcon sx={{ fontSize: 32 }} />,
                title: 'AI Image Analysis',
                desc: 'Upload a picture of a found item, and our AI will automatically classify, tag, and detect the color, category, and brand.'
              },
              {
                icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 32 }} />,
                title: 'Smart Matching',
                desc: 'Our neural matching backend runs background scans to suggest near-instant matches based on attributes, location, and visual similarity.'
              },
              {
                icon: <QrCodeScannerOutlinedIcon sx={{ fontSize: 32 }} />,
                title: 'QR Recovery Tags',
                desc: 'Generate scan-ready QR stickers for keys, wallets, or electronics. Scanners can message you securely without exposing phone numbers.'
              },
              {
                icon: <VerifiedOutlinedIcon sx={{ fontSize: 32 }} />,
                title: 'Secure Verification',
                desc: 'Verify the claimant’s ownership with customizable dynamic verification questions before authorizing the return of an item.'
              },
              {
                icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 32 }} />,
                title: 'Instant Notifications',
                desc: 'Receive real-time notifications on your dashboard and email when a potential match is found or verification goes through.'
              }
            ].map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box 
                      sx={{ 
                        display: 'inline-flex', 
                        p: 1.5, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(198, 162, 126, 0.1)', 
                        color: 'secondary.main', 
                        mb: 3 
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box 
        sx={{ 
          py: 12, 
          bgcolor: '#FFFDF8', 
          borderTop: '1px solid rgba(139, 111, 71, 0.08)',
          borderBottom: '1px solid rgba(139, 111, 71, 0.08)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              The seamless pathway from losing an item to getting it safely back in your hands.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ position: 'relative' }}>
            {[
              { step: '01', title: 'Report Item', desc: 'Describe the details, add a photo, and specify the approximate location.' },
              { step: '02', title: 'AI Analysis', desc: 'Our computer vision engine extracts tags and details instantly.' },
              { step: '03', title: 'Smart Match', desc: 'Algorithms check both databases to cross-reference attributes.' },
              { step: '04', title: 'Verification', desc: 'The owner answers dynamic security questions to prove identity.' },
              { step: '05', title: 'Recovery', desc: 'Arrange secure logistics, chat safely, and complete the recovery.' }
            ].map((step, idx) => (
              <Grid item xs={12} sm={6} md={2.4} key={idx}>
                <Box sx={{ p: 2, position: 'relative', height: '100%' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 900, 
                      color: 'rgba(198, 162, 126, 0.15)', 
                      fontSize: '3.5rem', 
                      lineHeight: 1, 
                      mb: 1,
                      fontFamily: '"Outfit", sans-serif'
                    }}
                  >
                    {step.step}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials / Trust Section */}
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              Reunited and Refined
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Read testimonies of real people who recovered high-value assets securely.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                name: 'Sarah Jenkins',
                role: 'Product Designer at Vercel',
                quote: 'RecoverAI is a game changer. I left my MacBook in an airport terminal, and within 4 hours, a match was suggested. The secure owner-verification questions put me at complete ease.',
                avatar: 'SJ'
              },
              {
                name: 'David Carter',
                role: 'Full Stack Engineer',
                quote: 'I attach RecoverAI QR codes to my camera gear. I lost my keys at a coffee shop, and someone scanned the tag and messaged me. I didn’t have to share any private contact info.',
                avatar: 'DC'
              },
              {
                name: 'Elena Rostova',
                role: 'Travel Journalist',
                quote: 'The AI image tagging is so fast. When I found a lost wallet in a library, I just uploaded a picture. It automatically tagged it, and the owner was found in minutes.',
                avatar: 'ER'
              }
            ].map((testimonial, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Rating value={5} readOnly sx={{ mb: 2, color: 'secondary.main' }} size="small" />
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.primary', mb: 4, lineHeight: 1.6 }}>
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.contrastText', fontWeight: 600 }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 14, 
          textAlign: 'center', 
          bgcolor: '#FFFDF8', 
          borderTop: '1px solid rgba(139, 111, 71, 0.08)'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Ready to secure your belongings?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400, maxWidth: '600px', mx: 'auto' }}>
            Create a free account to report lost items, generate recovery QR tags, or register items you find.
          </Typography>
          <Button 
            component={Link} 
            to="/register" 
            variant="contained" 
            color="primary"
            size="large" 
            sx={{ px: 6, py: 2, fontSize: '1.1rem', fontWeight: 700 }}
          >
            Create an Account
          </Button>
        </Container>
      </Box>
    </Box>
  );
};
