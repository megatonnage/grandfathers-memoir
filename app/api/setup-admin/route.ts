import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to avoid build-time initialization
async function getFirestore() {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials not configured');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getFirestore();
}

export async function POST(request: NextRequest) {
  try {
    const { email, uid, secret } = await request.json();

    // Simple secret check - change this to something only you know
    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getFirestore();

    // Check if user already exists
    const existingUser = await db.collection('users').doc(uid).get();
    if (existingUser.exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create admin user
    await db.collection('users').doc(uid).set({
      email: email.toLowerCase(),
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      inviteStatus: 'accepted',
    });

    return NextResponse.json({ success: true, message: 'Admin user created' });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
