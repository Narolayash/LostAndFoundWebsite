const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Read MONGODB_URI from .env.local
const envPath = path.join(__dirname, '../.env.local');
let mongodbUri = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI\s*=\s*(.*)/);
  if (match) {
    mongodbUri = match[1].trim();
  }
}

if (!mongodbUri) {
  console.error('\x1b[31mError: MONGODB_URI not defined in .env.local\x1b[0m');
  console.log('Please configure .env.local first.');
  process.exit(1);
}

// 2. Connect and Clear Database
console.log('Connecting to MongoDB...');
mongoose.connect(mongodbUri)
  .then(async () => {
    console.log('Connected successfully. Wiping collections...');
    const db = mongoose.connection;
    const itemsCollection = db.collection('items');
    const messagesCollection = db.collection('messages');

    // Wipe collections
    const itemsResult = await itemsCollection.deleteMany({});
    const messagesResult = await messagesCollection.deleteMany({});

    console.log(`Successfully cleared ${itemsResult.deletedCount} items.`);
    console.log(`Successfully cleared ${messagesResult.deletedCount} messages.`);

    console.log('\n\x1b[32mSuccess: Database cleared completely!\x1b[0m');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\x1b[31mDatabase connection failed:\x1b[0m', err.message);
    process.exit(1);
  });
