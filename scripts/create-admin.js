// Run this with: node scripts/create-admin.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// You'll need to download your service account key from Firebase Console
// Project Settings > Service Accounts > Generate new private key
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function createAdmin() {
  const email = process.argv[2] || 'your-email@example.com';
  const uid = process.argv[3]; // Your Firebase Auth UID
  
  if (!uid) {
    console.log('Usage: node create-admin.js <email> <uid>');
    console.log('');
    console.log('To get your UID:');
    console.log('1. Try to sign in on the site first (it will fail but create your auth account)');
    console.log('2. Go to Firebase Console > Authentication > Users');
    console.log('3. Copy your UID');
    console.log('4. Run: node create-admin.js your-email@example.com your-uid');
    return;
  }

  await db.collection('users').doc(uid).set({
    email: email.toLowerCase(),
    displayName: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    inviteStatus: 'accepted'
  });

  console.log(`Admin user created: ${email}`);
}

createAdmin().catch(console.error);
