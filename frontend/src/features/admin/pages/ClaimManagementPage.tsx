import { useEffect, useState, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Stack, 
  TextField, 
  MenuItem, 
  Button, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Checkbox, 
  TablePagination, 
  Drawer, 
  Avatar, 
  Chip, 
  LinearProgress, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import { adminService } from '../services/adminService';
import { AuthContext } from '../../auth/context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Search as SearchIcon,
  VisibilityOutlined as ViewIcon,
  CheckCircleOutlined as CheckIcon,
  WarningAmberOutlined as WarningIcon,
  HistoryOutlined as HistoryIcon,
  Close as CloseIcon,
  PriorityHighOutlined as PriorityHighIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

// ----------------------------------------------------------------------
// Reusable Data Table Component (can be used for users or items later)
// ----------------------------------------------------------------------
interface Column {
  id: string;
  label: React.ReactNode;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
}

interface ReusableTableProps {
  columns: Column[];
  children: React.ReactNode;
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReusableTable = ({
  columns,
  children,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}: ReusableTableProps) => {
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, fontWeight: 700, backgroundColor: '#FFFCF8', color: '#7B5B3D' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{ bgcolor: '#FFFCF8', borderTop: '1px solid #E7DDD1' }}
      />
    </Box>
  );
};

export const ClaimManagementPage = () => {
  const { token } = useContext(AuthContext);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Table selection & Drawer states
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Confirmation dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | 'assign' | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchClaims = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await adminService.getClaims(token);
        // Backend compatibility checks
        if (Array.isArray(data)) {
          setClaims(data);
        } else if (data && Array.isArray(data.claims)) {
          setClaims(data.claims);
        } else if (data && data.success && Array.isArray(data.data)) {
          setClaims(data.data);
        } else {
          setClaims([]);
        }
      } catch (err) {
        setError('Error fetching claims logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [token]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ids = filteredClaims.map(c => c._id);
      setSelectedClaims(ids);
    } else {
      setSelectedClaims([]);
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedClaims(prev => [...prev, id]);
    } else {
      setSelectedClaims(prev => prev.filter(cId => cId !== id));
    }
  };

  // Drawer Handler
  const handleRowClick = (claim: any) => {
    setSelectedClaimId(claim._id);
    setIsDrawerOpen(true);
  };

  // Bulk actions triggers
  const handleBulkActionClick = (type: 'approve' | 'reject' | 'assign') => {
    setBulkActionType(type);
    setConfirmOpen(true);
  };

  const handleConfirmBulkAction = () => {
    setConfirmOpen(false);
    if (!bulkActionType) return;
    alert(`Bulk ${bulkActionType.toUpperCase()} action successfully processed for selected claim IDs: ${selectedClaims.join(', ')} (Development Mode Simulation)`);
    setSelectedClaims([]);
    setBulkActionType(null);
  };

  // Helper properties to get a single active claim details
  const getSelectedClaimDetail = () => {
    return claims.find(c => c._id === selectedClaimId);
  };

  const activeClaim = getSelectedClaimDetail();

  // Helper Priority/Risk Generator based on name/title strings for UI redesign completeness
  const getClaimPriority = (claim: any) => {
    const title = claim.item?.title?.toLowerCase() || '';
    if (title.includes('macbook') || title.includes('laptop') || title.includes('phone')) return { label: 'High', color: 'error' as const };
    if (title.includes('keys') || title.includes('charger')) return { label: 'Low', color: 'info' as const };
    return { label: 'Medium', color: 'warning' as const };
  };

  // Filter and Search logic
  const filteredClaims = claims.filter(c => {
    const matchesSearch = 
      (c._id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.item?.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.claimant?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.claimant?.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    const priorityInfo = getClaimPriority(c);
    const matchesPriority = priorityFilter === 'all' || priorityInfo.label.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sorting
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    return 0;
  });

  // Pagination slicing
  const paginatedClaims = sortedClaims.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Statistics counters
  const pendingCount = claims.filter(c => c.status === 'pending' || c.status === 'open').length;
  const approvedCount = claims.filter(c => c.status === 'approved').length;

  // Dynamic stats
  const highRiskCount = claims.filter(c => getClaimPriority(c).label === 'High').length;
  const getAvgProcessingTime = () => {
    const reviewedClaims = claims.filter(c => c.status !== 'pending' && c.status !== 'under_review' && c.status !== 'open');
    if (reviewedClaims.length === 0) return 'N/A';
    
    let totalMs = 0;
    reviewedClaims.forEach(c => {
      const created = new Date(c.createdAt).getTime();
      const updated = new Date(c.updatedAt).getTime();
      totalMs += (updated - created);
    });
    
    const avgHrs = (totalMs / reviewedClaims.length) / (1000 * 60 * 60);
    if (avgHrs < 1) {
      return '< 1 Hour';
    }
    if (avgHrs < 24) {
      return `${avgHrs.toFixed(1)} Hours`;
    }
    return `${(avgHrs / 24).toFixed(1)} Days`;
  };
  const avgProcessingTime = getAvgProcessingTime();

  const tableColumns = [
    { 
      id: 'select', 
      label: (
        <Checkbox
          indeterminate={selectedClaims.length > 0 && selectedClaims.length < filteredClaims.length}
          checked={filteredClaims.length > 0 && selectedClaims.length === filteredClaims.length}
          onChange={handleSelectAll}
        />
      ), 
      minWidth: 50 
    },
    { id: 'id', label: 'Claim ID', minWidth: 100 },
    { id: 'item', label: 'Item Details', minWidth: 200 },
    { id: 'claimant', label: 'Claimant', minWidth: 180 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'priority', label: 'Priority', minWidth: 110 },
    { id: 'confidence', label: 'AI Score', minWidth: 120 },
    { id: 'actions', label: 'Action', minWidth: 100 }
  ];

  // SKELETON LOADER
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
        <Skeleton variant="text" width={220} height={40} sx={{ mb: 4 }} />
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[1, 2, 3, 4].map(idx => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '14px' }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '18px' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Claim Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vetting operations console for RecoverAI moderators.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* SECTION 1: Dashboard Overview statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>PENDING CLAIMS</Typography>
                <Avatar sx={{ bgcolor: 'rgba(213, 155, 58, 0.08)', color: '#D59B3A', width: 28, height: 28 }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 850, mt: 1.5, mb: 0.5 }}>{pendingCount}</Typography>
              <Typography variant="caption" color="text.secondary">Requires review actions</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>APPROVED CLAIMS</Typography>
                <Avatar sx={{ bgcolor: 'rgba(79, 138, 91, 0.08)', color: '#4F8A5B', width: 28, height: 28 }}>
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 850, mt: 1.5, mb: 0.5 }}>{approvedCount}</Typography>
              <Typography variant="caption" color="text.secondary">Successfully matched</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>HIGH RISK CLAIMS</Typography>
                <Avatar sx={{ bgcolor: 'rgba(178, 76, 76, 0.08)', color: '#B24C4C', width: 28, height: 28 }}>
                  <PriorityHighIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 850, mt: 1.5, mb: 0.5 }}>{highRiskCount}</Typography>
              <Typography variant="caption" color="text.secondary">Conflict potentials</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>AVG REVIEW TIME</Typography>
                <Avatar sx={{ bgcolor: 'rgba(123, 91, 61, 0.08)', color: 'primary.main', width: 28, height: 28 }}>
                  <HistoryIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 850, mt: 1.5, mb: 0.5 }}>{avgProcessingTime}</Typography>
              <Typography variant="caption" color="text.secondary">Verification speeds</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SECTION 2: Search & Filters toolbar */}
      <Card elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8', mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Claim ID, Item or Claimant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
              }}
            />
          </Grid>

          <Grid item xs={6} sm={2.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={2.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Bulk action buttons indicator */}
      {selectedClaims.length > 0 && (
        <Card elevation={0} sx={{ p: 2, mb: 3, borderRadius: '12px', border: '1px solid rgba(184, 138, 90, 0.3)', bgcolor: 'rgba(184, 138, 90, 0.05)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {selectedClaims.length} Claims Selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" color="success" onClick={() => handleBulkActionClick('approve')}>
                Bulk Approve
              </Button>
              <Button size="small" variant="contained" color="error" onClick={() => handleBulkActionClick('reject')}>
                Bulk Reject
              </Button>
              <Button size="small" variant="outlined" color="primary" onClick={() => handleBulkActionClick('assign')}>
                Reassign Reviewer
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* SECTION 3: Claims Table Grid */}
      <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', overflow: 'hidden' }}>
        {sortedClaims.length === 0 ? (
          <Stack direction="column" alignItems="center" sx={{ py: 12, textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              No claims logs found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Try adjusting your query inputs or filter selections.
            </Typography>
          </Stack>
        ) : isMobile ? (
          // Mobile Card Matrix layout
          <Stack spacing={2} sx={{ p: 2 }}>
            {paginatedClaims.map((claim) => {
              const priorityInfo = getClaimPriority(claim);
              const score = claim.verificationScore ?? 65;
              return (
                <Card 
                  key={claim._id}
                  onClick={() => handleRowClick(claim)}
                  sx={{ p: 2, borderRadius: '12px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8', cursor: 'pointer' }}
                >
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      ID: {claim._id.substring(0, 8)}
                    </Typography>
                    <Chip 
                      label={claim.status.toUpperCase()} 
                      color={claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'error' : 'warning'}
                      size="small"
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }}
                    />
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {claim.item?.title || 'Untitled Report'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Claimant: {claim.claimant?.name || 'Guest'}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption">AI Score: <strong>{score}%</strong></Typography>
                    <Chip label={priorityInfo.label} color={priorityInfo.color} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }} />
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        ) : (
          // Desktop Table View
          <ReusableTable
            columns={tableColumns}
            count={sortedClaims.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          >
            {paginatedClaims.map((claim) => {
              const isSelected = selectedClaims.includes(claim._id);
              const priorityInfo = getClaimPriority(claim);
              const score = claim.verificationScore ?? 65;

              return (
                <TableRow 
                  hover 
                  key={claim._id}
                  selected={isSelected}
                  onClick={() => handleRowClick(claim)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(123, 91, 61, 0.02)' } }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(e, claim._id)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {claim._id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {claim.item?.title || 'Untitled Report'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {claim.item?.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {claim.claimant?.name || 'Guest Claimant'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {claim.claimant?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={claim.status.toUpperCase()} 
                      color={claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'error' : 'warning'}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={priorityInfo.label} 
                      color={priorityInfo.color}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {score}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={score} 
                        color={score >= 80 ? 'success' : 'warning'}
                        sx={{ width: 40, height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" component={Link} to={`/claims/review/${claim._id}`} onClick={(e) => e.stopPropagation()}>
                      <ViewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </ReusableTable>
        )}
      </Card>

      {/* SECTION 5: Slide-out Details Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 }, p: 3, bgcolor: '#FFFCF8' } }}
      >
        {activeClaim ? (
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Claim Details</Typography>
              <IconButton onClick={() => setIsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Box display="flex" gap={2}>
              <Box 
                component="img"
                src={activeClaim.item?.images?.[0] || 'https://via.placeholder.com/150'}
                sx={{ width: 80, height: 80, borderRadius: '8px', objectFit: 'cover' }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {activeClaim.item?.title || 'Untitled Report'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Category: {activeClaim.item?.category}
                </Typography>
                <Chip label={activeClaim.status.toUpperCase()} size="small" color={activeClaim.status === 'approved' ? 'success' : 'warning'} />
              </Box>
            </Box>

            <Divider />

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Claimant Details</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{activeClaim.claimant?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{activeClaim.claimant?.email}</Typography>
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>AI Match Confidence</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{activeClaim.verificationScore ?? 65}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={activeClaim.verificationScore ?? 65} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Stack>

            <Button 
              component={Link} 
              to={`/claims/review/${activeClaim._id}`}
              variant="contained" 
              color="primary"
              fullWidth
              sx={{ mt: 3, fontWeight: 700 }}
            >
              Open Evaluation Review
            </Button>
          </Stack>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="body2" color="text.secondary">No Claim Selected</Typography>
          </Box>
        )}
      </Drawer>

      {/* Confirmation dialog for Bulk actions */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} sx={{ '& .MuiPaper-root': { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Bulk Action</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 500 }}>
            Are you sure you want to execute bulk **{bulkActionType?.toUpperCase()}** actions for the selected claims? This will update multiple index documents inside the registry database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleConfirmBulkAction} variant="contained" color="primary" sx={{ fontWeight: 700 }}>
            Confirm Bulk Execution
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};
