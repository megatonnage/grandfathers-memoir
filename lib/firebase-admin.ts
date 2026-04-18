import * as admin from 'firebase-admin';

const formatPrivateKey = (key?: string) => {
  if (!key) return undefined;
  // Handle cases where Vercel injects literal quotes or escaped newlines
  return key.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error);
  }
}

export const adminDb = new admin.firestore.Firestore({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseId: "ongba",
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)
  }
});

export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
