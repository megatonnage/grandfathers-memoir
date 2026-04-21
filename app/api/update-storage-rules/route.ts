import { NextResponse } from 'next/server';
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

export async function POST() {
  try {
    // Initialize admin if not already done
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    const rules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read (view images)
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to upload to specific folders
    match /ba-ngoai-gallery/{fileName} {
      allow write: if request.auth != null;
    }
    
    match /gallery/{fileName} {
      allow write: if request.auth != null;
    }
  }
}`;

    // Note: Firebase Admin SDK doesn't support updating storage rules directly
    // You need to use the Firebase CLI or REST API
    // For now, return instructions
    return NextResponse.json({ 
      success: false, 
      message: 'Please update storage rules manually in Firebase Console',
      rules: rules
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update rules' }, { status: 500 });
  }
}