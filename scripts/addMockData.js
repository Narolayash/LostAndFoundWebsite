const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// 2. Define Mock Data
const mockItems = [
  {
    title: 'Black Leather Wallet',
    category: 'Wallet',
    type: 'lost',
    description: 'A black leather bi-fold wallet containing a student ID card and bus pass. Lost near the reading room.',
    location: 'Central Library',
    date: new Date('2026-06-01'),
    personName: 'Yash Narola',
    phone: '+1 123-456-7890',
    imageUrl: 'https://images.unsplash.com/photo-1627124118317-4e359f293124?w=800&auto=format&fit=crop&q=80',
    status: 'searching',
    createdAt: new Date(),
  },
  {
    title: 'Calculator Casio FX-991ES',
    category: 'Electronics',
    type: 'found',
    description: 'Found a Casio scientific calculator on the back bench of the CSE Lab. It has a tiny scratch on the back cover.',
    location: 'CSE Lab (Block A)',
    date: new Date('2026-06-02'),
    personName: 'Rahul Sharma',
    phone: '+1 987-654-3210',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    status: 'waiting',
    createdAt: new Date(),
  },
  {
    title: 'College ID Card',
    category: 'ID Card',
    type: 'lost',
    description: 'Laminated college ID card with enrollment number CS-2023-042. Lost during lunch break.',
    location: 'Parking Area',
    date: new Date('2026-06-03'),
    personName: 'Priya Patel',
    phone: '+1 555-0199',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    status: 'searching',
    createdAt: new Date(),
  },
  {
    title: 'Hydro Flask Water Bottle',
    category: 'Accessories',
    type: 'found',
    description: 'Navy blue 32oz Hydro Flask water bottle found near the juice bar. Kept safely in cafeteria counter.',
    location: 'Cafeteria',
    date: new Date('2026-06-04'),
    personName: 'Aman Gupta',
    phone: '+1 555-0144',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    status: 'returned',
    createdAt: new Date(),
  },
  {
    title: 'Sony WF-1000XM4 Earbuds',
    category: 'Electronics',
    type: 'lost',
    description: 'Grey charging case with both Sony earbuds inside. Left on the desk during afternoon lecture.',
    location: 'Classroom B204',
    date: new Date('2026-06-05'),
    personName: 'Sneha Reddy',
    phone: '+1 555-0188',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    status: 'recovered',
    createdAt: new Date(),
  },
  {
    title: 'SanDisk 64GB Pen Drive',
    category: 'Electronics',
    type: 'found',
    description: 'Silver metal SanDisk USB drive found plugged into system number 14. Has a red lanyard.',
    location: 'Computer Lab 3',
    date: new Date('2026-06-06'),
    personName: 'Vikram Singh',
    phone: '+1 555-0177',
    imageUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=800&auto=format&fit=crop&q=80',
    status: 'waiting',
    createdAt: new Date(),
  },
  {
    title: 'Gold Frame Spectacles',
    category: 'Accessories',
    type: 'lost',
    description: 'Ray-Ban spectacles with gold metal frame in a brown case. Lost during the seminar on AI.',
    location: 'Auditorium',
    date: new Date('2026-06-07'),
    personName: 'Riya Sen',
    phone: '+1 555-0166',
    imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80',
    status: 'searching',
    createdAt: new Date(),
  },
  {
    title: 'Key Ring with 3 Keys',
    category: 'Keys',
    type: 'found',
    description: 'Keys with a silver ring and a blue tag saying "Home". Found near the main entry gate.',
    location: 'Main Gate',
    date: new Date('2026-06-08'),
    personName: 'Dev Malhotra',
    phone: '+1 555-0155',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
    status: 'waiting',
    createdAt: new Date(),
  },
  {
    title: 'Introduction to Robotics Textbook',
    category: 'Books',
    type: 'lost',
    description: 'Hardcover textbook, 4th edition by Craig. Has a yellow highlighter mark on the side.',
    location: 'Seminar Hall 1',
    date: new Date('2026-06-09'),
    personName: 'Kunal Shah',
    phone: '+1 555-0111',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80',
    status: 'searching',
    createdAt: new Date(),
  },
  {
    title: 'Nike Sports Backpack',
    category: 'Accessories',
    type: 'lost',
    description: 'Black and white Nike backpack containing gym clothes, sports shoes, and a protein shaker.',
    location: 'Sports Ground',
    date: new Date('2026-06-10'),
    personName: 'Kabir Kapoor',
    phone: '+1 555-0122',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    status: 'searching',
    createdAt: new Date(),
  },
  {
    title: 'Apple Watch Series 8',
    category: 'Electronics',
    type: 'found',
    description: 'Found a black Apple Watch Series 8 (45mm) on the bench next to the basketball court.',
    location: 'Gymnasium',
    date: new Date('2026-06-11'),
    personName: 'Rohit Sharma',
    phone: '+1 555-0133',
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&auto=format&fit=crop&q=80',
    status: 'returned',
    createdAt: new Date(),
  },
  {
    title: 'Blue Premium Umbrella',
    category: 'Accessories',
    type: 'found',
    description: 'Large blue umbrella with a wooden handle. Found near the staircase in the science block.',
    location: 'Science Block Escalator',
    date: new Date('2026-06-12'),
    personName: 'Neha Verma',
    phone: '+1 555-0211',
    imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80',
    status: 'waiting',
    createdAt: new Date(),
  },
  {
    title: 'MacBook Pro Charger 96W',
    category: 'Electronics',
    type: 'lost',
    description: 'Apple USB-C power adapter (96W) along with a 2-meter braided cable. Lost in the study cubicles.',
    location: 'Library Block (2nd Floor)',
    date: new Date('2026-06-12'),
    personName: 'Sameer Dixit',
    phone: '+1 555-0222',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    status: 'searching',
    createdAt: new Date(),
  },
  {
    title: 'White Chemistry Lab Coat',
    category: 'Books',
    type: 'found',
    description: 'Clean white lab coat, size Medium, found hanging on hanger 4. Stitched initials "P.J." on collar.',
    location: 'Chemistry Lab 2',
    date: new Date('2026-06-13'),
    personName: 'Pooja Joshi',
    phone: '+1 555-0233',
    imageUrl: 'https://images.unsplash.com/photo-1581093588401-f5c32e68b481?w=800&auto=format&fit=crop&q=80',
    status: 'waiting',
    createdAt: new Date(),
  },
  {
    title: 'Brown Leather Key Holder',
    category: 'Keys',
    type: 'lost',
    description: 'A brown leather key pouch containing 4 keys and a small pocket knife. Lost near the cash counter.',
    location: 'College Canteen',
    date: new Date('2026-06-13'),
    personName: 'Tanmay Bhat',
    phone: '+1 555-0244',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
    status: 'searching',
    createdAt: new Date(),
  },
];

// 3. Connect and Seed Database
console.log('Connecting to MongoDB...');
mongoose.connect(mongodbUri)
  .then(async () => {
    console.log('Connected successfully. Preparing to seed...');
    const db = mongoose.connection;
    const itemsCollection = db.collection('items');
    const messagesCollection = db.collection('messages');

    // Clear existing records
    await itemsCollection.deleteMany({});
    await messagesCollection.deleteMany({});
    console.log('Cleared existing items and messages collections.');

    // Inject secure editTokens into mock items
    const seededItems = mockItems.map(item => ({
      ...item,
      editToken: crypto.randomUUID()
    }));

    const result = await itemsCollection.insertMany(seededItems);
    console.log(`Successfully seeded ${result.insertedCount} mock items.`);

    // Seed initial messages for the first item
    const firstItemId = result.insertedIds[0];
    if (firstItemId) {
      await messagesCollection.insertMany([
        {
          itemId: firstItemId,
          senderName: 'Rahul',
          message: 'Is this black wallet yours? I found one matching your description near the Library.',
          createdAt: new Date(),
        },
        {
          itemId: firstItemId,
          senderName: 'Yash',
          message: 'Yes, it belongs to me! It has a student ID in it.',
          createdAt: new Date(),
        },
        {
          itemId: firstItemId,
          senderName: 'Rahul',
          message: 'Great, meet me near Library Block reception area at 3 PM today.',
          createdAt: new Date(),
        },
      ]);
      console.log('Seeded 3 initial messages linked to first item.');
    }

    console.log('\n\x1b[32mSuccess: Database seeded successfully for demo!\x1b[0m');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\x1b[31mDatabase connection failed:\x1b[0m', err.message);
    process.exit(1);
  });
