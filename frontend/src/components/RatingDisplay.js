import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating as MuiRating,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import {
  Star as StarIcon,
  RateReview as ReviewIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { getProductRatings, getDeliveryBoyRatings, getRatingColor, getRatingText } from '../services/ratings';

const RatingDisplay = ({ 
  itemId, 
  type, 
  averageRating = 0, 
  totalRatings = 0, 
  showReviews = true,
  maxHeight = 400,
  refreshTrigger = 0
}) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const fetchRatings = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (type === 'product') {
        response = await getProductRatings(itemId, { page, limit: 5, sort });
      } else if (type === 'delivery') {
        response = await getDeliveryBoyRatings(itemId, { page, limit: 5, sort });
      }

      if (!response || !response.ratings) {
        setRatings([]);
        setTotalPages(1);
      } else {
        setRatings(response.ratings);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      setError(error.message || 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId && showReviews) {
      fetchRatings();
    }
  }, [itemId, page, sort, showReviews, refreshTrigger]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating]++;
    });
    return distribution;
  };

  const renderRatingSummary = () => (
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Box textAlign="center">
        <Typography variant="h4" fontWeight="bold" color={getRatingColor(averageRating)}>
          {averageRating.toFixed(1)}
        </Typography>
        <MuiRating
          value={averageRating}
          readOnly
          precision={0.1}
          size="small"
          sx={{
            '& .MuiRating-iconFilled': {
              color: getRatingColor(averageRating),
            },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {getRatingText(averageRating)}
        </Typography>
      </Box>
      
      <Divider orientation="vertical" flexItem />
      
      <Box flex={1}>
        <Typography variant="h6" fontWeight="bold">
          {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Based on customer reviews
        </Typography>
      </Box>
    </Box>
  );

  const renderRatingBar = (stars, count) => {
    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
    return (
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        <Typography variant="body2" minWidth={20}>
          {stars}
        </Typography>
        <Box flex={1} bgcolor="grey.200" borderRadius={1} height={8} position="relative">
          <Box
            bgcolor={getRatingColor(stars)}
            height="100%"
            borderRadius={1}
            width={`${percentage}%`}
          />
        </Box>
        <Typography variant="body2" minWidth={30}>
          {count}
        </Typography>
      </Box>
    );
  };

  const renderRatingDistribution = () => {
    const distribution = getRatingDistribution();
    return (
      <Box mt={2}>
        <Typography variant="subtitle2" mb={1}>
          Rating Distribution
        </Typography>
        {[5, 4, 3, 2, 1].map(stars => (
          <Box key={stars}>
            {renderRatingBar(stars, distribution[stars])}
          </Box>
        ))}
      </Box>
    );
  };

  const renderReviews = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Customer Reviews
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sort}
            label="Sort by"
            onChange={handleSortChange}
            startAdornment={<SortIcon fontSize="small" />}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="highest">Highest</MenuItem>
            <MenuItem value="lowest">Lowest</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : ratings.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          No reviews yet. Be the first to review!
        </Typography>
      ) : (
        <Box>
          {ratings.slice(0, showAllReviews ? ratings.length : 3).map((rating) => (
            <Card key={rating._id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {rating.user?.personalInfo?.fullName?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {rating.user?.personalInfo?.fullName || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(rating.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<StarIcon />}
                    label={rating.rating}
                    size="small"
                    sx={{
                      bgcolor: getRatingColor(rating.rating),
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Box>
                
                {rating.comment && (
                  <Typography variant="body2" mt={1}>
                    {rating.comment}
                  </Typography>
                )}

                {type === 'delivery' && rating.order && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Order: {rating.order.orderNumber}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          {ratings.length > 3 && (
            <Box textAlign="center" mt={2}>
              <Button
                variant="outlined"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? 'Show Less' : `Show All ${ratings.length} Reviews`}
              </Button>
            </Box>
          )}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                size="small"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      {renderRatingSummary()}
      
      {showReviews && (
        <>
          {renderRatingDistribution()}
          <Divider sx={{ my: 2 }} />
          {renderReviews()}
        </>
      )}
    </Box>
  );
};

export default RatingDisplay; 