const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicare'; // Change if needed

async function cleanupBadDeliveryBoys() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const DeliveryBoy = mongoose.connection.collection('deliveryboys');

  // Remove documents where location.current.lat or lng is missing or null
  const result = await DeliveryBoy.deleteMany({
    $or: [
      { 'location.current.lat': { $exists: false } },
      { 'location.current.lng': { $exists: false } },
      { 'location.current.lat': null },
      { 'location.current.lng': null },
      { 'location.current': { $type: 'object', $not: { $elemMatch: { lat: { $type: 'number' }, lng: { $type: 'number' } } } } }
    ]
  });

  await mongoose.disconnect();
}

cleanupBadDeliveryBoys().catch(err => {
  process.exit(1);
}); 