import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Stack,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Divider,
  LinearProgress,
  Dialog,
  DialogContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { uploadImage } from '../services/uploadService';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import {
  CloudUploadOutlined as CloudUploadIcon,
  LightbulbOutlined as LightbulbIcon,
  AutoAwesomeOutlined as AutoAwesomeIcon,
  InfoOutlined as InfoIcon,
  VerifiedUserOutlined as VerifiedUserIcon,
  CheckCircleOutlined as CheckCircleIcon
} from '@mui/icons-material';

export const ReportItemPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    color: '',
    brand: '',
    location: '',
    dateLostFound: new Date().toISOString().split('T')[0],
    images: [] as string[],
    status: 'open',
    notes: '' // Additional Notes
  });

  // Image Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // AI Analysis States
  const { analyzeImage, isAnalyzing } = useImageAnalysis();
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<{
    category?: string;
    color?: string;
    brand?: string;
    condition?: string;
    confidence?: string;
  } | null>(null);

  // Form Handling
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (typeVal: string) => {
    setFormData(prev => ({ ...prev, type: typeVal }));
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError('');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPG, PNG, and WEBP are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Max size is 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError('');

      const response = await uploadImage(file, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if ((response.statusCode === 200 || response.statusCode === 201) && response.data?.url) {
        const imageUrl = response.data.url;
        setUploadedFileName(file.name);
        setFormData(prev => ({
          ...prev,
          images: [imageUrl]
        }));

        // Auto-trigger step update
        if (activeStep === 0) {
          setActiveStep(1); // Advance to image step visually
        }

        // Trigger AI analysis automatically on first upload
        triggerAiAnalysis(imageUrl);
      } else {
        setUploadError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      images: []
    }));
    setUploadedFileName('');
    setAiResult(null);
    setAiTags([]);
    setActiveStep(0);
  };

  const triggerAiAnalysis = async (url: string) => {
    console.log("Calling AI...");

    const result = await analyzeImage(url);
    console.log("RESULT FROM HOOK:", result);

    console.log("AI Result:", result);

    if (!result) return;

    setFormData(prev => ({
      ...prev,
      category: result.category || "",
      color: result.color || "",
      brand: result.brand || "",
    }));

    setAiResult({
      category: result.category,
      color: result.color,
      brand: result.brand,
      condition: result.condition,
      confidence: "94%",
    });

    setAiTags(result.tags || []);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const payload = {
        type: formData.type as 'lost' | 'found',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        brand: formData.brand,
        location: formData.location,
        dateLostFound: formData.dateLostFound,
        images: formData.images,
        status: formData.status as 'open' | 'resolved'
      };

      const newItem = await createItem(payload);
      navigate(`/items/${newItem._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while reporting the item.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Item Details', 'Images', 'Review'];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      {/* SECTION 1: Page Header */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Report an Item
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Help reunite lost belongings by submitting accurate information.
          </Typography>
        </Box>
        <Chip
          icon={<VerifiedUserIcon sx={{ fontSize: '15px !important', color: '#4F8A5B !important' }} />}
          label="Secure Report"
          color="success"
          variant="outlined"
          sx={{
            height: 32,
            fontWeight: 700,
            borderColor: 'rgba(79, 138, 91, 0.25)',
            bgcolor: 'rgba(79, 138, 91, 0.04)',
            '& .MuiChip-label': { px: 1.5 }
          }}
        />
      </Box>

      {/* SECTION 2: Progress Indicator */}
      <Box sx={{ width: '100%', mb: 6, maxWidth: 600, mx: 'auto' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  style: {
                    color: index <= activeStep ? '#B88A5A' : '#E7DDD1',
                  }
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

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Left Side: Form Details */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '18px',
              border: '1px solid #E7DDD1',
              bgcolor: '#FFFCF8',
              boxShadow: '0 8px 30px rgba(123, 91, 61, 0.04)'
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3.5}>

                {/* Item Type selection */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'block' }}>
                    What happened to the item?
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant={formData.type === 'lost' ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => handleTypeChange('lost')}
                      sx={{
                        flexGrow: 1,
                        py: 1.75,
                        fontWeight: 700,
                        backgroundColor: formData.type === 'lost' ? '#B88A5A' : 'transparent',
                        borderColor: formData.type === 'lost' ? '#B88A5A' : '#E7DDD1',
                        color: formData.type === 'lost' ? '#FFFCF8' : '#7B5B3D'
                      }}
                    >
                      I lost this item
                    </Button>
                    <Button
                      variant={formData.type === 'found' ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => handleTypeChange('found')}
                      sx={{
                        flexGrow: 1,
                        py: 1.75,
                        fontWeight: 700,
                        backgroundColor: formData.type === 'found' ? '#B88A5A' : 'transparent',
                        borderColor: formData.type === 'found' ? '#B88A5A' : '#E7DDD1',
                        color: formData.type === 'found' ? '#FFFCF8' : '#7B5B3D'
                      }}
                    >
                      I found this item
                    </Button>
                  </Stack>
                </Grid>

                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Item Name"
                    placeholder="e.g. iPhone 15 Pro, House Keys"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Category"
                    placeholder="e.g. Electronics, Accessories, Keys"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    helperText="AI will suggest tags once an image is uploaded"
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="Include details like serial numbers, stickers, keychains, scratches, or unique marks..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Location"
                    placeholder="e.g. Science Library Room 204"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="date"
                    label="Date Lost/Found"
                    name="dateLostFound"
                    InputLabelProps={{ shrink: true }}
                    value={formData.dateLostFound}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Color */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Color"
                    placeholder="e.g. Navy Blue, Space Grey"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Brand */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    placeholder="e.g. Apple, Sony, Herschel"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Additional Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Additional Notes"
                    placeholder="Any specific return instructions or secure verification queries..."
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Image Upload Area */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'block' }}>
                    Upload Item Images
                  </Typography>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileInput}
                  />

                  {uploadError && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
                      {uploadError}
                    </Alert>
                  )}

                  {/* State 2: Uploading */}
                  {isUploading && (
                    <Box
                      sx={{
                        p: 5,
                        textAlign: 'center',
                        borderRadius: '16px',
                        border: '1px solid #E7DDD1',
                        bgcolor: '#FFFCF8',
                        minHeight: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Uploading image... {uploadProgress}%
                      </Typography>
                      <Box sx={{ width: '80%', maxWidth: 320 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    </Box>
                  )}

                  {/* State 3: Uploaded */}
                  {!isUploading && formData.images.length > 0 && (
                    <Box className="fade-in" sx={{ transition: 'all 0.3s ease' }}>
                      <Card
                        elevation={0}
                        sx={{
                          position: 'relative',
                          borderRadius: '16px',
                          border: '1px solid #E7DDD1',
                          overflow: 'hidden',
                          maxHeight: '320px',
                          width: '100%',
                          bgcolor: '#FFFCF8'
                        }}
                      >
                        <Box
                          component="img"
                          src={formData.images[0]}
                          alt="Uploaded preview"
                          sx={{
                            width: '100%',
                            height: '100%',
                            maxHeight: '320px',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                        />

                        {/* Success Badge */}
                        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#FFFCF8 !important' }} />}
                            label="Upload Successful"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 700, color: '#FFFCF8' }}
                          />
                        </Box>
                      </Card>

                      {/* Image details & Action controls */}
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center" flexWrap="wrap" gap={1}>
                        {uploadedFileName && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, flexGrow: 1 }}>
                            File: {uploadedFileName}
                          </Typography>
                        )}
                        <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ fontWeight: 700 }}>
                          Change Image
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => setZoomImage(formData.images[0])} sx={{ fontWeight: 700 }}>
                          View Full Image
                        </Button>
                        <Button size="small" variant="text" color="error" onClick={handleRemoveImage} sx={{ fontWeight: 700 }}>
                          Remove Image
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  {/* State 1: Idle (or State 4: Error fallback) */}
                  {!isUploading && formData.images.length === 0 && (
                    <Box
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        p: 4.5,
                        textAlign: 'center',
                        borderRadius: '16px',
                        border: '2px dashed',
                        borderColor: isDragging ? 'primary.main' : '#E7DDD1',
                        bgcolor: isDragging ? 'rgba(184, 138, 90, 0.03)' : '#FFFCF8',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(184, 138, 90, 0.02)'
                        }
                      }}
                    >
                      <Stack direction="column" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 48, height: 48 }}>
                          <CloudUploadIcon />
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Drag images here or <span style={{ color: '#7B5B3D', textDecoration: 'underline' }}>Browse Files</span>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supports JPG, PNG, WEBP up to 5MB
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </Grid>

                {/* Submit Area */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate('/items')}
                      sx={{ py: 1.5, px: 4, fontWeight: 700 }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isLoading || isUploading || isAnalyzing}
                      sx={{ py: 1.5, px: 4, fontWeight: 700 }}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </Stack>
                </Grid>

              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: AI Preview & Helpful Tips */}
        <Grid item xs={12} md={4}>
          <Stack spacing={4}>

            {/* SECTION 5: AI Analysis Preview Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                border: '1px solid #E7DDD1',
                bgcolor: '#FFFCF8',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: 'primary.main' }} />
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 34, height: 34 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AI Preview
                  </Typography>
                </Box>

                {formData.images.length > 0 || isAnalyzing ? (
                  <Stack spacing={2.5}>
                    {/* Display Uploaded Image inside AI Preview Panel */}
                    {formData.images.length > 0 && (
                      <Box
                        component="img"
                        src={formData.images[0]}
                        alt="AI Preview"
                        sx={{
                          width: '100%',
                          maxHeight: '140px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '1px solid #E7DDD1'
                        }}
                      />
                    )}

                    {isAnalyzing ? (
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: '8px', bgcolor: 'rgba(184, 138, 90, 0.03)' }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          Waiting for AI analysis...
                        </Typography>
                      </Stack>
                    ) : aiResult ? (
                      <Stack spacing={1.5}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Category
                          </Typography>
                          <Chip label={aiResult.category || 'General'} size="small" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Color
                          </Typography>
                          <Chip label={aiResult.color || 'Unknown'} size="small" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Confidence
                          </Typography>
                          <Chip
                            label={aiResult.confidence || '94%'}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: 'rgba(79, 138, 91, 0.08)', color: '#4F8A5B', height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>

                        {aiTags.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750, mb: 0.5, display: 'block' }}>
                              Visual Tags
                            </Typography>
                            <Box display="flex" gap={0.5} flexWrap="wrap">
                              {aiTags.map((tag, idx) => (
                                <Chip key={idx} label={tag} size="small" sx={{ fontSize: '0.6rem', fontWeight: 600, height: 18 }} />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        AI analysis completed with no visual tags.
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Stack direction="column" alignItems="center" spacing={2} sx={{ py: 5, px: 2, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        bgcolor: 'rgba(184, 138, 90, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(184, 138, 90, 0.08)'
                      }}
                    >
                      <InfoIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      No image uploaded
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      Upload an image of the item to preview categories, colors, and potential matches calculated automatically by AI.
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* SECTION 6: Helpful Tips Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                border: '1px solid #E7DDD1',
                bgcolor: '#FFFCF8',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 34, height: 34 }}>
                    <LightbulbIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Helpful Tips
                  </Typography>
                </Box>
                <Stack spacing={2.5}>
                  <Box display="flex" gap={2}>
                    <Box sx={{ mt: 0.25, width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontWeight: 500 }}>
                      <strong>Good Lighting:</strong> Capture photos in well-lit areas to ensure correct item color representation.
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    <Box sx={{ mt: 0.25, width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontWeight: 500 }}>
                      <strong>Multiple Angles:</strong> If possible, upload photos showing front, back, and any distinguishing markings.
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    <Box sx={{ mt: 0.25, width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontWeight: 500 }}>
                      <strong>Unique identifiers:</strong> List any engravings, keychains, stickers, or specific scuff marks in the description.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>
      {/* Full Image Zoom Dialog */}
      <Dialog
        open={!!zoomImage}
        onClose={() => setZoomImage(null)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiPaper-root': { bgcolor: 'transparent', boxShadow: 'none' } }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center' }}>
          {zoomImage && (
            <Box
              component="img"
              src={zoomImage}
              alt="Zoomed preview"
              sx={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};
