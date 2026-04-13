import * as admin from 'firebase-admin';

// Initialize Firebase Admin only if it hasn't been initialized already to prevent Next.js hot-reload crashes
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newline characters if securely stored in a single line
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error);
  }
}

// Explicitly initialize the database class to target the correctly named instance instead of '(default)'
export const adminDb = new admin.firestore.Firestore({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseId: "ongba",
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
});

export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
