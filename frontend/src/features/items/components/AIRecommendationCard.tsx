import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Stack, 
  Button, 
  CircularProgress,
  List,
  Divider
} from '@mui/material';
import { 
  Check as CheckIcon,
  LocationOnOutlined as LocationIcon,
  CalendarTodayOutlined as CalendarIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface MatchItem {
  _id: string;
  title: string;
  category: string;
  color?: string;
  brand?: string;
  location: string;
  dateLostFound: string;
  type: 'lost' | 'found';
  images: string[];
  aiTags?: string[];
}

interface AIRecommendationCardProps {
  item: MatchItem;
  similarityScore: number;
  matchedFields: {
    category: boolean;
    color: boolean;
    brand: boolean;
    matchingTags: string[];
  };
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  item,
  similarityScore,
  matchedFields
}) => {
  // Score color determinations
  const getProgressColor = () => {
    if (similarityScore >= 90) return '#4F8A5B'; // Green
    if (similarityScore >= 70) return '#D59B3A'; // Amber
    return '#2E6CB5'; // Blue
  };

  const ringColor = getProgressColor();

  const formattedDate = new Date(item.dateLostFound).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        border: '2px solid transparent',
        background: `linear-gradient(#FFFCF8, #FFFCF8) padding-box, linear-gradient(135deg, ${ringColor}80, rgba(231,221,209,0.3)) border-box`,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(123, 91, 61, 0.08)',
          borderColor: ringColor
        }
      }}
    >
      {/* Thumbnail + Score Ring overlap */}
      <Box sx={{ height: 160, position: 'relative', overflow: 'hidden' }}>
        <Box 
          component="img"
          src={item.images?.[0] || 'https://images.unsplash.com/photo-1584824486509-112e4181f1b6?auto=format&fit=crop&q=80'}
          alt={item.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Type Badge */}
        <Chip 
          label={item.type.toUpperCase()} 
          color={item.type === 'lost' ? 'error' : 'success'}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontWeight: 800,
            fontSize: '0.65rem',
            height: 20
          }}
        />

        {/* Circular Match Score Ring */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255, 252, 248, 0.95)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress 
            variant="determinate" 
            value={similarityScore} 
            size={38} 
            thickness={4} 
            style={{ color: ringColor }}
            sx={{ position: 'absolute' }}
          />
          <Typography variant="caption" sx={{ fontWeight: 800, color: ringColor, fontSize: '0.75rem' }}>
            {similarityScore}%
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category */}
        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {item.category}
        </Typography>
        
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, mb: 2, color: 'text.primary', minHeight: 48, lineHeight: 1.2 }}>
          {item.title}
        </Typography>

        {/* Details list */}
        <Stack spacing={1} sx={{ mb: 2.5 }}>
          <Box display="flex" alignItems="center" gap={1.25}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.location}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1.25}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {formattedDate}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Matched Fields List */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Matched Attributes
          </Typography>
          <List dense disablePadding sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {matchedFields.category && (
              <Chip 
                icon={<CheckIcon sx={{ fontSize: '12px !important' }} />}
                label="Category" 
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600 }}
              />
            )}
            {matchedFields.color && (
              <Chip 
                icon={<CheckIcon sx={{ fontSize: '12px !important' }} />}
                label="Color" 
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600 }}
              />
            )}
            {matchedFields.brand && (
              <Chip 
                icon={<CheckIcon sx={{ fontSize: '12px !important' }} />}
                label="Brand" 
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600 }}
              />
            )}
          </List>
        </Box>

        {/* Matching Tags Chips */}
        {matchedFields.matchingTags && matchedFields.matchingTags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Matching Visual Tags
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {matchedFields.matchingTags.map((tag, idx) => (
                <Chip 
                  key={idx} 
                  label={`#${tag}`} 
                  size="small" 
                  sx={{ 
                    fontSize: '0.6rem', 
                    fontWeight: 700, 
                    height: 18, 
                    bgcolor: 'rgba(184, 138, 90, 0.06)',
                    color: 'primary.main',
                    borderColor: 'rgba(184, 138, 90, 0.15)',
                    border: '1px solid'
                  }} 
                />
              ))}
            </Box>
          </Box>
        )}

        {/* View Match Button */}
        <Box sx={{ mt: 'auto' }}>
          <Button
            component={Link}
            to={`/items/${item._id}`}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
          >
            View Match
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
