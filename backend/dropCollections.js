const mongoose = require('mongoose');
const { mongoURI } = require('./config');

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      await mongoose.connection.db.dropCollection('usernotifications');
      console.log('Dropped collection: usernotifications');
    } catch (e) {
      console.log('usernotifications collection does not exist or could not be dropped.');
    }
    try {
      await mongoose.connection.db.dropCollection('notifications');
      console.log('Dropped collection: notifications');
    } catch (e) {
      console.log('notifications collection does not exist or could not be dropped.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 