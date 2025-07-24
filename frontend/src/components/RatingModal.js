import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating as MuiRating,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { submitRating } from '../services/ratings';

const RatingModal = ({ open, onClose, order, type, itemId, itemName, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ratingData = {
        type: type,
        rating: rating,
        comment: comment.trim()
      };

      if (order && order._id) {
        ratingData.orderId = order._id;
      }
      if (type === 'product' || type === 'medicine') {
        ratingData.itemId = itemId;
      }

      await submitRating(ratingData);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Close modal and notify parent
      onClose();
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      setError(error.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  const getTitle = () => {
    if (type === 'product') {
      return `Rate ${itemName}`;
    } else if (type === 'delivery') {
      return 'Rate Delivery Service';
    }
    return 'Rate Your Experience';
  };

  const getDescription = () => {
    if (type === 'product') {
      return `How was your experience with ${itemName}?`;
    } else if (type === 'delivery') {
      return 'How was your delivery experience?';
    }
    return 'Please share your experience with us.';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <StarIcon color="primary" />
          <Typography variant="h6">{getTitle()}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {getDescription()}
          </Typography>
          
          {order && (
            <Chip 
              label={`Order #${order.orderNumber}`} 
              variant="outlined" 
              size="small"
              sx={{ mb: 2 }}
            />
          )}
        </Box>

        <Box mb={3}>
          <Typography variant="subtitle1" mb={1}>
            Your Rating *
          </Typography>
          <MuiRating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            precision={0.5}
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#ff9800',
              },
              '& .MuiRating-iconHover': {
                color: '#ff9800',
              },
            }}
          />
          {rating > 0 && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              {rating} star{rating !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        <Box mb={2}>
          <TextField
            label="Comment (Optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Share your experience, suggestions, or feedback..."
            inputProps={{ maxLength: 500 }}
          />
          <Typography variant="caption" color="text.secondary">
            {comment.length}/500 characters
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || rating === 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingModal; 