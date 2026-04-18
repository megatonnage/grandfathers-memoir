import * as admin from 'firebase-admin';

const formatPrivateKey = (key?: string) => {
  if (!key) return undefined;
  try {
    if (key.startsWith('"') && key.endsWith('"')) {
      const parsed = JSON.parse(key);
      if (typeof parsed === 'string') return parsed;
    }
  } catch (e) {}
  return key.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '').trim();
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

let dbInstance;
try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    dbInstance = new admin.firestore.Firestore({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      databaseId: "ongba",
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)
      }
    });
  }
} catch (e) {
  console.log('Skipping Firestore initialization at build time due to invalid key format.');
}
export const adminDb = dbInstance;

let storageInstance, authInstance;
try {
  if (admin.apps.length > 0) {
    storageInstance = admin.storage();
    authInstance = admin.auth();
  }
} catch (e) {
  console.log('Skipping Storage/Auth init at build time.');
}

export const adminStorage = storageInstance;
export const adminAuth = authInstance;
