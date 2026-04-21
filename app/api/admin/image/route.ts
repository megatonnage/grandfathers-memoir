import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Dynamic import to avoid build-time initialization
    const { adminStorage } = await import('../../../../lib/firebase-admin');
    
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucket = adminStorage.bucket(); 
    // Clean filename to prevent url escaping issues
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `memoir-images/${Date.now()}_${safeName}`;
    const fileRef = bucket.file(fileName);
    
    await fileRef.save(buffer, {
      contentType: file.type || 'image/jpeg',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    });

    // Explicitly make the uploaded image publicly accessible
    await fileRef.makePublic();
    const downloadURL = fileRef.publicUrl();

    return NextResponse.json({ 
      success: true, 
      downloadURL
    });
    
  } catch (e) {
    console.error("Firebase Image Proxy error:", e);
    return NextResponse.json({ success: false, error: 'Server error uploading image to Firebase Admin' }, { status: 500 });
  }
}
