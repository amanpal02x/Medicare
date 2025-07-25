console.log('SERVER STARTED:');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['https://medicare-v.vercel.app', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Added PATCH here
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const pharmacistRoutes = require('./routes/pharmacist');
const deliveryRoutes = require('./routes/delivery');
const orderRoutes = require('./routes/orders');
const prescriptionRoutes = require('./routes/prescriptions');
const notificationRoutes = require('./routes/notifications');
const discountRoutes = require('./routes/discounts');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const categoryRoutes = require('./routes/categories');
const medicinesRoutes = require('./routes/medicines');
const productRoutes = require('./routes/products');
const dealsRoutes = require('./routes/deals');
const supportRoutes = require('./routes/support');
const ratingRoutes = require('./routes/ratings');
app.use('/api/auth', authRoutes);
app.use('/api/pharmacist', pharmacistRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/products', productRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/ratings', ratingRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to MediCare Backend');
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "https://medicare-v.vercel.app",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Join pharmacist room
  socket.on('join-pharmacist', (pharmacistId) => {
    socket.join(`pharmacist-${pharmacistId}`);
    socket.join('pharmacists'); // Join general pharmacists room
  });
  
  // Join admin room
  socket.on('join-admin', () => {
    socket.join('admin-room');
  });
  
  // Join delivery room
  socket.on('join-delivery', (deliveryId) => {
    socket.join(`delivery-${deliveryId}`);
    socket.join('delivery-boys'); // Join general delivery boys room for order notifications
  });
  
  // Join user room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('test', (data) => {
    socket.emit('testResponse', { message: 'Test response from server', timestamp: new Date() });
  });

  // Chat event handling
  socket.on('sendMessage', (msg) => {
    // msg: { toRoom, message, from, fromRole, fromName, timestamp }
    if (msg && msg.toRoom && msg.message) {
      io.to(msg.toRoom).emit('chatMessage', msg);
    }
  });

  // Pharmacist location/status update (real-time)
  socket.on('pharmacist-location-update', (data) => {
    // data: { pharmacistId, lat, lng, online }
    io.to('pharmacists').emit('pharmacist-location-update', data); // broadcast to all pharmacists
    io.emit('pharmacist-location-update', data); // broadcast to all clients (users, delivery, etc.)
  });

  // Delivery boy location/status update (real-time)
  socket.on('deliveryboy-location-update', (data) => {
    // data: { deliveryBoyId, lat, lng, online }
    io.to('delivery-boys').emit('deliveryboy-location-update', data); // broadcast to all delivery boys
    io.emit('deliveryboy-location-update', data); // broadcast to all clients (users, pharmacists, etc.)
  });
  
  socket.on('disconnect', () => {
    // User disconnected
  });
});

// Make io available globally
global.io = io;

// Import order timeout handler
const { checkAndExpireOrders } = require('./utils/orderTimeoutHandler');

// Set up interval to check for expired orders every 5 seconds
setInterval(async () => {
  try {
    const expiredCount = await checkAndExpireOrders();
    // Process expired orders silently
  } catch (error) {
    // Error in order timeout check
  }
}, 5000); // Check every 5 seconds

app.use((req, res, next) => {
  next();
});

server.listen(PORT, () => {
  // Server running
}); 