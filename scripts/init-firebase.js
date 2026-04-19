// Initialize Firebase with your admin user
// Run: node scripts/init-firebase.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Replace these with your actual Firebase project credentials
// You can get these from Firebase Console → Project Settings → Service Accounts
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID || "ongba-19991",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
};

if (!serviceAccount.private_key || !serviceAccount.client_email) {
  console.log('❌ Missing Firebase credentials');
  console.log('');
  console.log('Please set these environment variables:');
  console.log('  - FIREBASE_PROJECT_ID');
  console.log('  - FIREBASE_PRIVATE_KEY');
  console.log('  - FIREBASE_CLIENT_EMAIL');
  console.log('');
  console.log('Or download your service account key from:');
  console.log('Firebase Console → Project Settings → Service Accounts → Generate new private key');
  console.log('');
  console.log('Then run:');
  console.log('  export FIREBASE_PROJECT_ID=your-project-id');
  console.log('  export FIREBASE_PRIVATE_KEY="$(cat serviceAccountKey.json | jq -r .private_key)"');
  console.log('  export FIREBASE_CLIENT_EMAIL=your-service-account-email');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function initFirebase() {
  const email = process.argv[2];
  const displayName = process.argv[3] || 'Admin User';
  
  if (!email) {
    console.log('Usage: node init-firebase.js <email> [displayName]');
    console.log('');
    console.log('Example:');
    console.log('  node init-firebase.js your@email.com "Your Name"');
    process.exit(1);
  }

  // Generate a temporary UID (you'll update this after first sign-in)
  const tempUid = 'temp_' + Date.now();

  try {
    // Create the users collection with your admin document
    await db.collection('users').doc(tempUid).set({
      email: email.toLowerCase(),
      displayName: displayName,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      inviteStatus: 'accepted',
      note: 'Temporary UID - update after first sign-in'
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Email:', email);
    console.log('Role: admin');
    console.log('Temporary UID:', tempUid);
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to http://localhost:3000/admin');
    console.log('2. Sign in with your email');
    console.log('3. Check Firebase Console → Authentication → Users for your actual UID');
    console.log('4. Go to http://localhost:3000/setup to update your UID');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

initFirebase();
