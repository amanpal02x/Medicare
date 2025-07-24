const Rating = require('../models/Rating');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Medicine = require('../models/Medicine');
const DeliveryBoy = require('../models/DeliveryBoy');

// Submit a rating
exports.submitRating = async (req, res) => {
  try {
    const { orderId, type, rating, comment, itemId } = req.body;
    const userId = req.user.id;

    let order = null;
    if (type === 'delivery') {
      // Validate order exists and belongs to user for delivery ratings
      order = await Order.findOne({ 
        _id: orderId, 
        user: userId,
        status: 'delivered' 
      });
      if (!order) {
        return res.status(404).json({ 
          message: 'Order not found or not eligible for rating' 
        });
      }
    }

    // Check if rating already exists (for delivery, or for product/medicine if orderId is provided)
    let existingRating = null;
    if (type === 'delivery' && orderId) {
      existingRating = await Rating.findOne({
        user: userId,
        order: orderId,
        type: type
      });
    }
    if (existingRating) {
      return res.status(400).json({ 
        message: 'You have already rated this order' 
      });
    }

    let ratingData = {
      user: userId,
      rating: rating,
      comment: comment,
      type: type
    };
    if (type === 'delivery') {
      ratingData.order = orderId;
    }

    // Add item reference based on type
    if (type === 'product' || type === 'medicine') {
      if (!itemId) {
        return res.status(400).json({ 
          message: 'Item ID is required for product/medicine rating' 
        });
      }
      // Check if it's a product or medicine
      const product = await Product.findById(itemId);
      const medicine = await Medicine.findById(itemId);
      if (product) {
        ratingData.type = 'product';
        ratingData.product = itemId;
      } else if (medicine) {
        ratingData.type = 'medicine';
        ratingData.medicine = itemId;
      } else {
        return res.status(404).json({ 
          message: 'Product or medicine not found' 
        });
      }
    } else if (type === 'delivery') {
      if (!order.deliveryBoy) {
        return res.status(400).json({ 
          message: 'No delivery boy assigned to this order' 
        });
      }
      ratingData.deliveryBoy = order.deliveryBoy;
    }

    // Create rating
    const newRating = new Rating(ratingData);
    await newRating.save();

    // If delivery rating, mark order as rated
    if (type === 'delivery') {
      await Order.findByIdAndUpdate(orderId, { deliveryRated: true });
    }

    // Update average ratings
    await updateAverageRatings(ratingData.type, itemId || (order && order.deliveryBoy));

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ 
      message: 'Failed to submit rating',
      error: error.message 
    });
  }
};

// Get ratings for a product or medicine
exports.getProductRatings = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    // Check if it's a product or medicine
    const product = await Product.findById(itemId);
    const medicine = await Medicine.findById(itemId);

    if (!product && !medicine) {
      return res.status(404).json({ 
        message: 'Product or medicine not found' 
      });
    }

    const query = {
      status: 'active'
    };

    if (product) {
      query.type = 'product';
      query.product = itemId;
    } else {
      query.type = 'medicine';
      query.medicine = itemId;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'highest':
        sortObj = { rating: -1 };
        break;
      case 'lowest':
        sortObj = { rating: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const ratings = await Rating.find(query)
      .populate('user', 'personalInfo.fullName')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Rating.countDocuments(query);

    // Calculate average rating
    const avgRating = await Rating.aggregate([
      { $match: query },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
    ]);

    const averageRating = avgRating.length > 0 ? avgRating[0].avgRating : 0;
    const totalRatings = avgRating.length > 0 ? avgRating[0].totalRatings : 0;

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10
    });

  } catch (error) {
    console.error('Error getting product ratings:', error);
    res.status(500).json({ 
      message: 'Failed to get ratings',
      error: error.message 
    });
  }
};

// Get ratings for a delivery boy
exports.getDeliveryBoyRatings = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({ 
        message: 'Delivery boy not found' 
      });
    }

    const query = {
      type: 'delivery',
      deliveryBoy: deliveryBoyId,
      status: 'active'
    };

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'highest':
        sortObj = { rating: -1 };
        break;
      case 'lowest':
        sortObj = { rating: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const ratings = await Rating.find(query)
      .populate('user', 'personalInfo.fullName')
      .populate('order', 'orderNumber')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Rating.countDocuments(query);

    // Calculate average rating
    const avgRating = await Rating.aggregate([
      { $match: query },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
    ]);

    const averageRating = avgRating.length > 0 ? avgRating[0].avgRating : 0;
    const totalRatings = avgRating.length > 0 ? avgRating[0].totalRatings : 0;

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10
    });

  } catch (error) {
    console.error('Error getting delivery boy ratings:', error);
    res.status(500).json({ 
      message: 'Failed to get ratings',
      error: error.message 
    });
  }
};

// Get user's ratings
exports.getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;

    const query = { user: userId };
    if (type) {
      query.type = type;
    }

    const ratings = await Rating.find(query)
      .populate('order', 'orderNumber')
      .populate('product', 'name image')
      .populate('medicine', 'name image')
      .populate('deliveryBoy', 'personalInfo.fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Rating.countDocuments(query);

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting user ratings:', error);
    res.status(500).json({ 
      message: 'Failed to get ratings',
      error: error.message 
    });
  }
};

// Update a rating
exports.updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const existingRating = await Rating.findOne({
      _id: ratingId,
      user: userId
    });

    if (!existingRating) {
      return res.status(404).json({ 
        message: 'Rating not found' 
      });
    }

    // Update rating
    existingRating.rating = rating;
    if (comment !== undefined) {
      existingRating.comment = comment;
    }

    await existingRating.save();

    // Update average ratings
    const itemId = existingRating.product || existingRating.medicine || existingRating.deliveryBoy;
    await updateAverageRatings(existingRating.type, itemId);

    res.json({
      message: 'Rating updated successfully',
      rating: existingRating
    });

  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ 
      message: 'Failed to update rating',
      error: error.message 
    });
  }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({
      _id: ratingId,
      user: userId
    });

    if (!rating) {
      return res.status(404).json({ 
        message: 'Rating not found' 
      });
    }

    await Rating.findByIdAndDelete(ratingId);

    // Update average ratings
    const itemId = rating.product || rating.medicine || rating.deliveryBoy;
    await updateAverageRatings(rating.type, itemId);

    res.json({
      message: 'Rating deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ 
      message: 'Failed to delete rating',
      error: error.message 
    });
  }
};

// Helper function to update average ratings
async function updateAverageRatings(type, itemId) {
  try {
    if (type === 'product') {
      // Check if it's a product or medicine
      const product = await Product.findById(itemId);
      const medicine = await Medicine.findById(itemId);

      if (product) {
        const avgRating = await Rating.aggregate([
          { $match: { product: itemId, type: 'product', status: 'active' } },
          { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
        ]);

        if (avgRating.length > 0) {
          await Product.findByIdAndUpdate(itemId, {
            averageRating: Math.round(avgRating[0].avgRating * 10) / 10,
            totalRatings: avgRating[0].totalRatings
          });
        }
      } else if (medicine) {
        const avgRating = await Rating.aggregate([
          { $match: { medicine: itemId, type: 'medicine', status: 'active' } },
          { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
        ]);

        if (avgRating.length > 0) {
          await Medicine.findByIdAndUpdate(itemId, {
            averageRating: Math.round(avgRating[0].avgRating * 10) / 10,
            totalRatings: avgRating[0].totalRatings
          });
        }
      }
    } else if (type === 'delivery') {
      const avgRating = await Rating.aggregate([
        { $match: { deliveryBoy: itemId, type: 'delivery', status: 'active' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
      ]);

      if (avgRating.length > 0) {
        await DeliveryBoy.findByIdAndUpdate(itemId, {
          'ratings.average': Math.round(avgRating[0].avgRating * 10) / 10,
          'ratings.totalRatings': avgRating[0].totalRatings
        });
      }
    }
  } catch (error) {
    console.error('Error updating average ratings:', error);
  }
} 