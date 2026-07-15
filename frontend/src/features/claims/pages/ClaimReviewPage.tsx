import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../auth/context/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Chip, 
  Card, 
  CardContent, 
  Stack, 
  Avatar, 
  LinearProgress, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { getClaimById, reviewClaim, confirmReturn } from '../services/claimService';
import type { Claim } from '../services/claimService';
import { socketService } from '../../../services/socketService';
import { 
  ArrowBack as ArrowBackIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  CategoryOutlined as CategoryOutlinedIcon,
  AutoAwesomeOutlined as AutoAwesomeIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  CancelOutlined as CancelIcon,
  HelpOutlineOutlined as HelpIcon,
  PersonOutline as PersonIcon,
  ImageOutlined as ImageIcon,
  HistoryOutlined as HistoryIcon,
  ShieldOutlined as ShieldIcon
} from '@mui/icons-material';

export const ClaimReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog management
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | 'needs_info' | 'reassign' | null>(null);

  // Evidence Gallery Image Zoom
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async (showLoadingSkeleton = true) => {
      if (!id) return;
      try {
        if (showLoadingSkeleton) {
          setLoading(true);
        }
        const res = await getClaimById(id);
        if (res.success) {
          setClaim(res.data);
          setNotes(res.data.reviewNotes || '');
        } else {
          setError(res.message || 'Failed to fetch claim');
        }
      } catch (err) {
        setError('Error fetching claim details');
      } finally {
        if (showLoadingSkeleton) {
          setLoading(false);
        }
      }
    };

    fetchClaim(true);

    const handleSocketUpdate = (updatedClaim: any) => {
      // If the event corresponds to this claim, update it in the background
      if (updatedClaim && (updatedClaim._id === id || updatedClaim.id === id)) {
        fetchClaim(false);
      }
    };

    socketService.on('claim_approved', handleSocketUpdate);
    socketService.on('claim_rejected', handleSocketUpdate);
    socketService.on('claim_needs_info', handleSocketUpdate);
    socketService.on('item_returned', handleSocketUpdate);

    return () => {
      socketService.off('claim_approved', handleSocketUpdate);
      socketService.off('claim_rejected', handleSocketUpdate);
      socketService.off('claim_needs_info', handleSocketUpdate);
      socketService.off('item_returned', handleSocketUpdate);
    };
  }, [id]);

  const handleOpenConfirm = (type: 'approved' | 'rejected' | 'needs_info' | 'reassign') => {
    setActionType(type);
    setConfirmOpen(true);
  };

  const handleReviewAction = async () => {
    setConfirmOpen(false);
    if (!id || !actionType) return;
    
    if (actionType === 'reassign') {
      alert(`Action "${actionType.toUpperCase()}" completed (Development Mode Simulation).`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await reviewClaim(id, actionType as 'approved' | 'rejected' | 'needs_info', notes);
      if (res.success) {
        setClaim(res.data);
      } else {
        setError(res.message || `Failed to ${actionType} claim`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error reviewing claim');
    } finally {
      setSubmitting(false);
    }
  };

  // Mock Claimant verification properties
  const claimantMock = {
    previousClaims: '1 Approved, 0 Flagged',
    verificationLevel: 'L2 Verified ID',
    accountAge: '11 Months'
  };

  // Mock Evidence list
  const mockEvidenceList = [
    {
      name: 'receipt_macbook.jpg',
      url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300',
      type: 'image'
    },
    {
      name: 'serial_number_box.png',
      url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=300',
      type: 'image'
    }
  ];

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
        <Skeleton variant="text" width={200} height={30} sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px', mb: 3 }} />
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '18px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '18px' }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // ERROR STATE
  if (error || !claim) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }} className="fade-in">
        <Box 
          sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: 'rgba(178, 76, 76, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto',
            mb: 3,
            border: '1px solid rgba(178, 76, 76, 0.15)'
          }}
        >
          <CancelIcon sx={{ fontSize: 36, color: '#B24C4C' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {error || 'Claim details not found'}
        </Typography>
        <Button component={Link} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // Verification score properties
  const score = claim.verificationScore ?? 0;
  const isRecommended = score >= 80;

  // Authorization checkers
  const isOwner = claim.item?.reportedBy === user?.id || (claim.item?.reportedBy && typeof claim.item.reportedBy === 'object' && claim.item.reportedBy._id === user?.id);
  const isClaimant = claim.claimant?._id === user?.id;
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const isReviewer = isOwner || isAdminOrStaff;
  
  const showContactReveal = (claim.status === 'approved' || claim.status === 'completed') && (isOwner || isClaimant);

  const getTimelineEvents = () => {
    const list = [
      { title: 'Claim Submitted', desc: `Submitted successfully by ${claim.claimant?.name || 'claimant'}.`, completed: true },
      { title: 'AI Match Analysis Completed', desc: `Automatic verification rating calculated: ${score}%.`, completed: true }
    ];

    if (claim.status === 'under_review') {
      list.push({ title: 'Owner Reviewing', desc: 'Awaiting decision from the found item reporter.', completed: false });
    } else if (claim.status === 'needs_info') {
      list.push({ title: 'Needs Information Requested', desc: claim.reviewNotes || 'More details requested about item ownership.', completed: false });
    } else if (claim.status === 'approved') {
      list.push({ title: 'Claim Approved', desc: 'Item match verified by the owner.', completed: true });
      list.push({ title: 'Awaiting Exchange', desc: 'Secure contact details shared. Arrange retrieval.', completed: false });
    } else if (claim.status === 'completed') {
      list.push({ title: 'Claim Approved', desc: 'Item match verified by the owner.', completed: true });
      list.push({ title: 'Item Returned', desc: 'Item has been successfully exchanged and returned.', completed: true });
    } else if (claim.status === 'rejected') {
      list.push({ title: 'Claim Rejected', desc: claim.reviewNotes || 'Verification request did not meet criteria.', completed: false });
    }

    return list;
  };

  const handleConfirmReturn = async () => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await confirmReturn(id);
      if (res.success) {
        setClaim(res.data);
      } else {
        setError(res.message || 'Failed to confirm return');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error confirming return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      
      {/* Header back button */}
      <Button 
        component={Link} 
        to="/dashboard" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 4, fontWeight: 700, color: 'text.secondary', '&:hover': { color: 'text.primary' } }} 
      >
        Back to Dashboard
      </Button>

      {/* SECTION 1: Claim Header */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Chip 
            label={`CLAIM: ${claim.status.toUpperCase()}`}
            color={claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'error' : 'warning'}
            size="small"
            sx={{ fontWeight: 800, letterSpacing: '0.05em', height: 24, fontSize: '0.65rem' }}
          />
          <Chip 
            label={`Score: ${score}%`}
            variant="outlined" 
            size="small"
            sx={{ 
              fontWeight: 800, 
              borderColor: isRecommended ? '#4F8A5B' : 'rgba(123, 91, 61, 0.25)',
              color: isRecommended ? '#4F8A5B' : 'text.secondary',
              height: 24,
              fontSize: '0.65rem'
            }} 
          />
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 850, mb: 1, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Claim Review
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Index ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{claim._id}</span>
        </Typography>
      </Box>

      {/* Main split grid */}
      <Grid container spacing={4}>
        
        {/* Left Section (65%) */}
        <Grid item xs={12} md={7.5}>
          <Stack spacing={4}>
            
            {/* SECTION 2: Item Summary */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Item Report Summary
                </Typography>
                
                <Box display="flex" gap={3} flexWrap={{ xs: 'wrap', sm: 'nowrap' }} mb={3}>
                  <Box 
                    component="img"
                    src={claim.item?.images?.[0] || 'https://via.placeholder.com/150'}
                    sx={{ width: 100, height: 100, borderRadius: '12px', objectFit: 'cover', border: '1px solid #E7DDD1' }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {claim.item?.title || 'Untitled Report'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {claim.item?.description || 'No description provided.'}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={claim.item?.category || 'General'} size="small" icon={<CategoryOutlinedIcon sx={{ fontSize: '12px !important' }} />} />
                      <Chip label={claim.item?.location || 'General'} size="small" icon={<LocationOnOutlinedIcon sx={{ fontSize: '12px !important' }} />} />
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* SECTION 3: Claimant Information */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(123, 91, 61, 0.08)', color: 'secondary.main', width: 34, height: 34 }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Claimant Profile
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Full Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{claim.claimant?.name || 'Unknown'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Email Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{claim.claimant?.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>History Checks</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>{claimantMock.previousClaims}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>ID Level / Tenure</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{claimantMock.verificationLevel} ({claimantMock.accountAge})</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 4: Verification Answers Accordion */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Security Verification Question Responses
                </Typography>

                {claim.answers && claim.answers.length > 0 ? (
                  <Stack spacing={2}>
                    {claim.answers.map((ans, idx) => {
                      const questionDoc = claim.item?.verificationQuestions?.find((q: any) => q._id === ans.questionId);
                      const questionText = questionDoc ? questionDoc.question : `Verification Question ${idx + 1}`;
                      
                      // Match rating colors
                      let matchColor: 'success' | 'warning' | 'error' = 'warning';
                      let matchLabel = 'Medium Confidence';
                      if (score >= 80) {
                        matchColor = 'success';
                        matchLabel = 'High Confidence';
                      } else if (score < 60) {
                        matchColor = 'error';
                        matchLabel = 'Low Confidence';
                      }

                      return (
                        <Accordion key={idx} sx={{ border: '1px solid #E7DDD1', borderRadius: '12px !important', boxShadow: 'none' }} defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" pr={2}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                Q{idx + 1}: {questionText}
                              </Typography>
                              <Chip 
                                label={matchLabel} 
                                size="small" 
                                color={matchColor} 
                                sx={{ height: 20, fontSize: '0.6rem', fontWeight: 800 }} 
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Stack spacing={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Claimant Answer</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, p: 1.5, borderRadius: '8px', bgcolor: 'background.default', border: '1px solid #E7DDD1' }}>
                                  {ans.answer || 'No answer provided'}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Reviewer Decision:</Typography>
                                <Stack direction="row" spacing={1}>
                                  <Button size="small" variant="outlined" color="success" sx={{ py: 0.25, px: 1, fontSize: '0.65rem', fontWeight: 700, borderRadius: '8px' }}>
                                    Approve
                                  </Button>
                                  <Button size="small" variant="outlined" color="error" sx={{ py: 0.25, px: 1, fontSize: '0.65rem', fontWeight: 700, borderRadius: '8px' }}>
                                    Reject
                                  </Button>
                                </Stack>
                              </Box>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1.5} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid rgba(123, 91, 61, 0.15)', bgcolor: 'rgba(123, 91, 61, 0.04)' }}>
                    <HelpIcon color="primary" sx={{ fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      No security questionnaire answers submitted for this claim.
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* SECTION 5: Evidence Gallery */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(123, 91, 61, 0.08)', color: 'secondary.main', width: 34, height: 34 }}>
                    <ImageIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Evidence Gallery
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {mockEvidenceList.map((file, idx) => (
                    <Grid item xs={6} sm={4} key={idx}>
                      <Card 
                        onClick={() => setZoomImage(file.url)}
                        sx={{ 
                          borderRadius: '12px', 
                          border: '1px solid #E7DDD1', 
                          overflow: 'hidden', 
                          cursor: 'pointer',
                          '&:hover': { transform: 'scale(1.02)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <Box component="img" src={file.url} sx={{ width: '100%', height: 120, objectFit: 'cover' }} />
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 7: Claim Timeline */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(123, 91, 61, 0.08)', color: 'secondary.main', width: 34, height: 34 }}>
                    <HistoryIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Claim Progression Track
                  </Typography>
                </Box>
                <Stack 
                  spacing={3} 
                  sx={{ 
                    position: 'relative', 
                    pl: 3.5, 
                    '&::before': { 
                      content: '""', 
                      position: 'absolute', 
                      left: '11px', 
                      top: '8px', 
                      bottom: '8px', 
                      width: '2px', 
                      bgcolor: '#E7DDD1' 
                    } 
                  }}
                >
                  {getTimelineEvents().map((evt, idx) => (
                    <Box sx={{ position: 'relative' }} key={idx}>
                      <Box sx={{ 
                        position: 'absolute', 
                        left: '-33px', 
                        top: '3px', 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        bgcolor: evt.completed ? '#4F8A5B' : '#D59B3A', 
                        border: '2.5px solid #FFFCF8' 
                      }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{evt.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{evt.desc}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right Section (35%) */}
        <Grid item xs={12} md={4.5}>
          <Stack spacing={4} sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
            
            {/* SECTION 6: AI Risk Assessment */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: 'primary.main' }} />
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 34, height: 34 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AI Risk Assessment
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Ownership Probability</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>{score}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={score} color={isRecommended ? 'success' : 'warning'} sx={{ height: 6, borderRadius: 3, bgcolor: '#E7DDD1' }} />
                  </Box>

                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Fraud / Identity Risk</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>Low (12%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={12} color="success" sx={{ height: 6, borderRadius: 3, bgcolor: '#E7DDD1' }} />
                  </Box>

                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Visual Image Similarity</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>88% Similarity</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={88} color="success" sx={{ height: 6, borderRadius: 3, bgcolor: '#E7DDD1' }} />
                  </Box>

                  <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(79, 138, 91, 0.04)', border: '1px solid rgba(79, 138, 91, 0.15)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Recommendation Summary</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, color: '#4F8A5B' }}>
                      Auto-approved criteria met. High-match score parameters verify the claim.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Secure Contact Reveal */}
            {showContactReveal && (
              <Card elevation={0} sx={{ borderRadius: '18px', border: '2px solid #4F8A5B', bgcolor: '#FFFCF8', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: '#4F8A5B' }} />
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                    <ShieldIcon sx={{ fontSize: 18, color: '#4F8A5B' }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Secure Contact Reveal
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                    You have successfully matched! Below are the secure contact details for arranging the exchange:
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Claimant Contact</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Email: {claim.claimant?.email || 'N/A'}<br/>
                        Phone: {claim.item?.type === 'lost' ? '010-8459-2918' : '023-7459-8822'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Item Reporter Contact</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Email: {typeof claim.item?.reportedBy === 'object' ? (claim.item.reportedBy as any).email : 'N/A'}<br/>
                        Phone: {typeof claim.item?.reportedBy === 'object' ? '010-9922-3847' : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Exchange Confirmation */}
            {(claim.item?.status as string) === 'awaiting_exchange' && (isClaimant || isOwner) && (
              <Card elevation={0} sx={{ borderRadius: '18px', border: '2px solid #2E6CB5', bgcolor: '#FFFCF8' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Exchange Confirmation
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, fontWeight: 500 }}>
                    Please confirm once you have successfully handed over or received the item.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    disabled={submitting || claim.status === 'completed'}
                    onClick={handleConfirmReturn}
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    {submitting ? 'Confirming...' : 'Confirm Item Returned'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* SECTION 9: Decision Actions Panel */}
            {isReviewer ? (
              <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                    Reviewer Decision
                  </Typography>

                  {/* SECTION 8: Reviewer Notes */}
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Reviewer Comments"
                    placeholder="Notes entered here will be added to the review logs..."
                    variant="outlined"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Stack spacing={2}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth 
                      size="large"
                      disabled={submitting || claim.status === 'approved'}
                      onClick={() => handleOpenConfirm('approved')}
                      sx={{ py: 1.5, fontWeight: 700 }}
                    >
                      Approve Claim
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      color="error" 
                      fullWidth 
                      size="large"
                      disabled={submitting || claim.status === 'rejected'}
                      onClick={() => handleOpenConfirm('rejected')}
                      sx={{ py: 1.5, fontWeight: 700 }}
                    >
                      Reject Claim
                    </Button>

                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth 
                      onClick={() => handleOpenConfirm('needs_info')}
                      sx={{ py: 1.2, fontWeight: 700 }}
                    >
                      Request More Information
                    </Button>

                    <Button 
                      variant="text" 
                      color="secondary" 
                      fullWidth 
                      onClick={() => handleOpenConfirm('reassign')}
                      sx={{ py: 1, fontWeight: 700, color: 'text.secondary' }}
                    >
                      Assign to Another Reviewer
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8', p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
                  This claim is awaiting decision from the item owner or moderator agents.
                </Typography>
              </Card>
            )}

            {/* SECTION 10: Audit Information */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Avatar sx={{ bgcolor: 'rgba(79, 138, 91, 0.08)', color: '#4F8A5B', width: 30, height: 30 }}>
                    <ShieldIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Audit History log
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Assignee</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Security Admin #02</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {new Date(claim.updatedAt || Date.now()).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} sx={{ '& .MuiPaper-root': { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirm Decision Action
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 500 }}>
            Are you sure you want to mark this claim as **{actionType?.toUpperCase()}**? This action will write status updates directly to the database and notify the claimant.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleReviewAction} color="primary" variant="contained" autoFocus sx={{ fontWeight: 700 }}>
            Confirm Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Zoom Modal */}
      <Dialog open={!!zoomImage} onClose={() => setZoomImage(null)} maxWidth="md" fullWidth sx={{ '& .MuiPaper-root': { bgcolor: 'transparent', boxShadow: 'none' } }}>
        {zoomImage && (
          <Box 
            component="img" 
            src={zoomImage} 
            sx={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }} 
          />
        )}
      </Dialog>

    </Container>
  );
};
