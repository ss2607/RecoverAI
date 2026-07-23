import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  Avatar,
  LinearProgress,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Item } from '../../items/services/itemService';
import { createClaim } from '../services/claimService';
import { getVerificationQuestions } from '../services/verificationService';
import type { VerificationQuestion } from '../services/verificationService';
import type { Answer } from '../services/claimService';
import {
  CloudUploadOutlined as CloudUploadIcon,
  VerifiedUserOutlined as VerifiedUserIcon,
  SecurityOutlined as SecurityIcon,
  InfoOutlined as InfoIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  CheckCircleOutlined as CheckCircleIcon,
  PersonOutline as PersonIcon,
  AssignmentOutlined as AssignmentIcon,
  AutoAwesomeOutlined as AutoAwesomeIcon
} from '@mui/icons-material';
import { uploadImage } from '../../items/services/uploadService';

interface ClaimFormProps {
  item: Item;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ item }) => {
  const navigate = useNavigate();

  // Stepper state
  // Visual Step 0: Identity Info
  // Visual Step 1: Ownership Details
  // Visual Step 2: Verification Questions
  // Visual Step 3: Review & Submit
  const [activeStep, setActiveStep] = useState(0);
  const [claimId, setClaimId] = useState<string | null>(null);

  // Form Fields
  const [identityData, setIdentityData] = useState({
    fullName: '',
    email: '',
    phone: '',
    relationship: '',
    reason: ''
  });

  const [ownershipData, setOwnershipData] = useState({
    description: '',
    uniqueMarks: '',
    purchaseDate: '',
    contents: '',
    lastLocation: ''
  });

  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Verification Questions from backend
  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Status & Errors
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Autosave Key
  const autosaveKey = `claim_autosave_${item._id}`;

  // Load Autosaved State
  useEffect(() => {
    const saved = sessionStorage.getItem(autosaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.identityData) setIdentityData(parsed.identityData);
        if (parsed.ownershipData) setOwnershipData(parsed.ownershipData);
        if (parsed.evidenceImages) setEvidenceImages(parsed.evidenceImages);
        if (parsed.activeStep) setActiveStep(parsed.activeStep);
        if (parsed.claimId) setClaimId(parsed.claimId);
        if (parsed.answers) setAnswers(parsed.answers);
      } catch (e) {
        console.error('Error loading autosaved state', e);
      }
    }
  }, [autosaveKey]);

  // Save Autosaved State
  const saveState = (updatedStep = activeStep, updatedClaimId = claimId, updatedAnswers = answers) => {
    const dataToSave = {
      identityData,
      ownershipData,
      evidenceImages,
      activeStep: updatedStep,
      claimId: updatedClaimId,
      answers: updatedAnswers
    };
    sessionStorage.setItem(autosaveKey, JSON.stringify(dataToSave));
  };

  // Load Verification Questions when component mounts or item changes
  useEffect(() => {
    if (!item) return;

    if (item.verificationQuestions && item.verificationQuestions.length > 0) {
      setQuestions(item.verificationQuestions as any);
      const initialAnswers: Record<string, string> = { ...answers };
      item.verificationQuestions.forEach(q => {
        if (initialAnswers[q._id] === undefined) {
          initialAnswers[q._id] = '';
        }
      });
      setAnswers(initialAnswers);
    } else {
      const fetchQuestions = async () => {
        try {
          setLoadingQuestions(true);
          const res = await getVerificationQuestions(item._id);
          if (res.success && Array.isArray(res.data)) {
            setQuestions(res.data);
            const initialAnswers: Record<string, string> = { ...answers };
            res.data.forEach(q => {
              if (initialAnswers[q._id] === undefined) {
                initialAnswers[q._id] = '';
              }
            });
            setAnswers(initialAnswers);
          } else {
            setSubmitError('Failed to load verification questions.');
          }
        } catch (err) {
          setSubmitError('An error occurred while loading questions.');
        } finally {
          setLoadingQuestions(false);
        }
      };
      fetchQuestions();
    }
  }, [item]);

  // Inline Validation Helpers
  const validateIdentity = () => {
    const errors: Record<string, string> = {};
    if (!identityData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!identityData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(identityData.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!identityData.relationship.trim()) errors.relationship = 'Please state your relationship to this item';
    if (!identityData.reason.trim()) errors.reason = 'Please explain the reason for this claim';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOwnership = () => {
    const errors: Record<string, string> = {};
    if (!ownershipData.description.trim()) errors.description = 'Please describe the item to verify ownership';
    if (!ownershipData.lastLocation.trim()) errors.lastLocation = 'Please verify where you last had the item';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIdentityData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    // trigger auto save
    setTimeout(() => saveState(), 50);
  };

  const handleOwnershipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOwnershipData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    setTimeout(() => saveState(), 50);
  };

  // Drag and Drop Evidence Upload
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processEvidenceFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processEvidenceFile(e.target.files[0]);
    }
  };

  const processEvidenceFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const res = await uploadImage(file, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
      if ((res.statusCode === 200 || res.statusCode === 201) && res.data?.url) {
        setEvidenceImages(prev => {
          const next = [...prev, res.data.url];
          setTimeout(() => saveState(), 50);
          return next;
        });
      }
    } catch (e) {
      console.error('Evidence upload error', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      setTimeout(() => saveState(), 50);
      return next;
    });
  };

  // Navigation Wizards
  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateIdentity()) return;
      setActiveStep(1);
      saveState(1);
    } else if (activeStep === 1) {
      if (!validateOwnership()) return;
      setActiveStep(2);
      saveState(2);
    } else if (activeStep === 2) {
      // Questions Validation
      const unanswered = questions.some(q => !answers[q._id]?.trim());
      if (unanswered) {
        setSubmitError('Please answer all verification questions.');
        return;
      }
      setSubmitError(null);
      setActiveStep(3);
      saveState(3);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      saveState(activeStep - 1);
    }
  };

  // Submit Final Answers
  const handleSubmitClaim = async () => {
    // Validate again that all questions have answers
    const unanswered = questions.some(q => !answers[q._id]?.trim());
    if (unanswered) {
      setSubmitError('Please answer all verification questions.');
      return;
    }

    try {
      setIsLoading(true);
      setSubmitError(null);
      const formattedAnswers: Answer[] = questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] || ''
      }));

      const res = await createClaim(item._id, formattedAnswers);
      console.log(res);
      if (res.success && res.data) {
        // Clear autosave
        sessionStorage.removeItem(autosaveKey);
        navigate(`/claims/${res.data._id}`);
      } else {
        setSubmitError(res.message || 'Failed to submit claim.');
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Error submitting claim');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper completion percentage calculation
  const getCompletionPercentage = () => {
    let completedFields = 0;
    let totalFields = 10; // Identity (5) + Ownership (5)

    if (identityData.fullName.trim()) completedFields++;
    if (identityData.email.trim()) completedFields++;
    if (identityData.phone.trim()) completedFields++;
    if (identityData.relationship.trim()) completedFields++;
    if (identityData.reason.trim()) completedFields++;

    if (ownershipData.description.trim()) completedFields++;
    if (ownershipData.uniqueMarks.trim()) completedFields++;
    if (ownershipData.purchaseDate.trim()) completedFields++;
    if (ownershipData.contents.trim()) completedFields++;
    if (ownershipData.lastLocation.trim()) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  const completionPercent = getCompletionPercentage();
  const steps = ['Identity', 'Ownership', 'Questions', 'Review'];

  return (
    <Grid container spacing={4} sx={{ mt: 1 }}>
      {/* Left (70%): Stepper form cards */}
      <Grid item xs={12} md={8}>
        <Stack spacing={4}>

          {/* Horizontal Stepper */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      style: { color: index <= activeStep ? '#B88A5A' : '#E7DDD1' }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: index <= activeStep ? 'text.primary' : 'text.disabled' }}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {submitError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{submitError}</Alert>}

          {/* Wizard step 1: Identity */}
          {activeStep === 0 && (
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 36, height: 36 }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Claimant Identity Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={identityData.fullName}
                      onChange={handleIdentityChange}
                      error={!!validationErrors.fullName}
                      helperText={validationErrors.fullName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={identityData.email}
                      onChange={handleIdentityChange}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      placeholder="Optional"
                      value={identityData.phone}
                      onChange={handleIdentityChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Relationship to Item"
                      name="relationship"
                      placeholder="e.g. Owner, Parent of Owner"
                      value={identityData.relationship}
                      onChange={handleIdentityChange}
                      error={!!validationErrors.relationship}
                      helperText={validationErrors.relationship}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={3}
                      label="Reason for Claim"
                      name="reason"
                      placeholder="Provide context explaining how the item was lost and why it belongs to you..."
                      value={identityData.reason}
                      onChange={handleIdentityChange}
                      error={!!validationErrors.reason}
                      helperText={validationErrors.reason}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Wizard step 2: Ownership Details */}
          {activeStep === 1 && (
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 36, height: 36 }}>
                    <AssignmentIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Ownership Proof & Details
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={3}
                      label="Describe the Item in Detail"
                      name="description"
                      placeholder="Include materials, colors, serial numbers, labels, brands..."
                      value={ownershipData.description}
                      onChange={handleOwnershipChange}
                      error={!!validationErrors.description}
                      helperText={validationErrors.description || "Describe specific scuff marks, decals, or stickers."}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Unique marks or Engravings"
                      name="uniqueMarks"
                      placeholder="Optional"
                      value={ownershipData.uniqueMarks}
                      onChange={handleOwnershipChange}
                      helperText="Any scratches, stickers, modifications, or engravings."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Approximate Date of Purchase"
                      name="purchaseDate"
                      InputLabelProps={{ shrink: true }}
                      value={ownershipData.purchaseDate}
                      onChange={handleOwnershipChange}
                      helperText="Optional purchase timeline"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contents inside the item"
                      name="contents"
                      placeholder="Optional"
                      value={ownershipData.contents}
                      onChange={handleOwnershipChange}
                      helperText="Specify what keys/documents/objects are inside."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Last Known Location"
                      name="lastLocation"
                      placeholder="e.g. Science Library Table #10"
                      value={ownershipData.lastLocation}
                      onChange={handleOwnershipChange}
                      error={!!validationErrors.lastLocation}
                      helperText={validationErrors.lastLocation || "Where did you last see the item?"}
                    />
                  </Grid>

                  {/* Evidence upload box */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Evidence Upload (Optional)
                    </Typography>
                    <Box
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('evidence-upload-file')?.click()}
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        border: '2px dashed #E7DDD1',
                        bgcolor: 'background.default',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                    >
                      <input
                        type="file"
                        id="evidence-upload-file"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                      />
                      {isUploading ? (
                        <CircularProgress variant="determinate" value={uploadProgress} size={24} />
                      ) : (
                        <Stack alignItems="center" spacing={1}>
                          <CloudUploadIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Drag receipts, serial number photos, or box labels here or click to browse
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {evidenceImages.length > 0 && (
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
                        {evidenceImages.map((url, idx) => (
                          <Box key={idx} sx={{ position: 'relative', width: 70, height: 70, borderRadius: '8px', overflow: 'hidden', border: '1px solid #E7DDD1' }}>
                            <Box component="img" src={url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Box
                              onClick={(e) => { e.stopPropagation(); handleRemoveEvidence(idx); }}
                              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '50%', cursor: 'pointer', px: 0.5 }}
                            >
                              <Typography variant="caption" color="error">×</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Wizard step 3: Verification Questions */}
          {activeStep === 2 && (
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3} width="100%">
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 36, height: 36 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AI Verification Questions
                  </Typography>
                  <Chip label="5 Questions" size="small" color="primary" variant="outlined" sx={{ ml: 'auto', fontWeight: 700 }} />
                </Box>

                {loadingQuestions ? (
                  <Stack direction="column" alignItems="center" sx={{ py: 6 }}>
                    <CircularProgress size={30} color="primary" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Loading verification requirements...
                    </Typography>
                  </Stack>
                ) : questions.length === 0 ? (
                  <Stack direction="column" alignItems="center" sx={{ py: 6, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      No verification questions required
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This item does not require additional verification questionnaires. Click next to review and submit.
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={2.5}>
                    {questions.map((q, index) => (
                      <Accordion key={q._id} defaultExpanded sx={{ border: '1px solid #E7DDD1', borderRadius: '12px !important', boxShadow: 'none' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {index + 1}. {q.question}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="State your answer clearly..."
                            value={answers[q._id] || ''}
                            onChange={(e) => {
                              const updatedAnswers = { ...answers, [q._id]: e.target.value };
                              setAnswers(updatedAnswers);
                              saveState(2, claimId, updatedAnswers);
                            }}
                          />
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wizard step 4: Review and Submit */}
          {activeStep === 3 && (
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(79, 138, 91, 0.08)', color: '#4F8A5B', width: 36, height: 36 }}>
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Final Review & Signature
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Claimant Identity</Typography>
                    <Grid container spacing={2} sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.default', border: '1px solid #E7DDD1' }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{identityData.fullName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{identityData.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{identityData.phone || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Relationship</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{identityData.relationship}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Proof Details</Typography>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.default', border: '1px solid #E7DDD1' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Proof Description</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>{ownershipData.description}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Last Known Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{ownershipData.lastLocation}</Typography>
                    </Box>
                  </Box>

                  {questions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Security Verification Responses</Typography>
                      <Stack spacing={1}>
                        {questions.map((q, index) => (
                          <Box key={q._id} sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.default', border: '1px solid #E7DDD1' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 0.5 }}>
                              Question {index + 1}: {q.question}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {answers[q._id] || 'Not answered'}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(79,138,91,0.04)', border: '1px solid rgba(79,138,91,0.15)', display: 'flex', gap: 1.5 }}>
                    <SecurityIcon color="success" sx={{ fontSize: 18 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      By submitting this claim request, you declare that all information provided is accurate and represent yourself as the rightful owner or authorized claimant. RecoverAI uses strict identity vetting checks.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Stepper Wizard Actions Area */}
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || isLoading}
              sx={{ py: 1.5, px: 3, fontWeight: 700 }}
            >
              Back
            </Button>

            {activeStep === 3 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitClaim}
                disabled={isLoading}
                sx={{ py: 1.5, px: 4, fontWeight: 700 }}
              >
                {isLoading ? 'Submitting Claim...' : 'Submit Claim'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={isLoading}
                sx={{ py: 1.5, px: 4, fontWeight: 700 }}
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
            )}
          </Stack>

        </Stack>
      </Grid>

      {/* Right (30%): Sticky summary cards panel */}
      <Grid item xs={12} md={4}>
        <Stack spacing={4} sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>

          {/* Sticky Summary Card */}
          <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Claim Summary
              </Typography>

              {/* Item Card Details */}
              <Box display="flex" gap={2} mb={3}>
                <Box
                  component="img"
                  src={item.images?.[0] || 'https://via.placeholder.com/150'}
                  sx={{ width: 64, height: 64, borderRadius: '8px', objectFit: 'cover' }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Category: {item.category}
                  </Typography>
                  <Chip
                    label={item.type.toUpperCase()}
                    size="small"
                    color={item.type === 'lost' ? 'error' : 'success'}
                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2} mb={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Claimant Profile
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {identityData.fullName || 'Guest Claimant'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {identityData.email || 'Email not entered'}
                  </Typography>
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Setup Progress
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      {completionPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercent}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#E7DDD1' }}
                  />
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Estimated Review
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    24-48 Hours
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(184, 138, 90, 0.04)', border: '1px solid rgba(184,138,90,0.1)', display: 'flex', gap: 1 }}>
                <VerifiedUserIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                  Verification rating: <strong>High</strong>. Provide photos to expedite approvals.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Privacy info panel */}
          <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Avatar sx={{ bgcolor: 'rgba(123, 91, 61, 0.08)', color: 'secondary.main', width: 30, height: 30 }}>
                  <InfoIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Privacy & Encryption
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block' }}>
                All evidence materials, serial codes, box labels, and identity records uploaded to RecoverAI are encrypted end-to-end and visible only to verified administrators and matching agents.
              </Typography>
            </CardContent>
          </Card>

        </Stack>
      </Grid>
    </Grid>
  );
};
