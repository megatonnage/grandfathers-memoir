import { NextResponse } from 'next/server';
import { adminStorage } from '../../../../lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload directly to Firebase Cloud Storage bucket
    const bucket = adminStorage.bucket(); 
    const fileRef = bucket.file(`chapters/${file.name}`);
    
    await fileRef.save(buffer, {
      contentType: file.type || 'text/markdown',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully uploaded ${file.name} to Firebase Storage!`
    });
    
  } catch (e) {
    console.error("Firebase Upload error:", e);
    return NextResponse.json({ success: false, error: 'Server error uploading to Firebase' }, { status: 500 });
  }
}
