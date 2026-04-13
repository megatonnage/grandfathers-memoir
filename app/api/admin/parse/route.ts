import { NextResponse } from 'next/server';
import { adminStorage, adminDb } from '../../../../lib/firebase-admin';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileName = body.fileName || "Ong's Book.md";

    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(`chapters/${fileName}`);
    
    // Check if file exists
    const [exists] = await fileRef.exists();
    if (!exists) {
      return NextResponse.json({ success: false, error: 'File not found in storage.' }, { status: 404 });
    }

    // Download content
    const [fileContent] = await fileRef.download();
    const rawMarkdown = fileContent.toString('utf-8');

    // Split by '## ' which appears to be chapter headings in the uploaded file
    const chapterBlocks = rawMarkdown.split(/^##\s/m);
    
    // First block is usually title/preamble before the first '##' chapter
    const chapters = [];
    
    const batch = adminDb.batch();

    chapterBlocks.forEach((block, index) => {
      // Skip empty fragments
      if (!block.trim()) return;

      const lines = block.split('\n');
      // If it's the very first block (index 0) and doesn't have a clean title, we treat it as Prologue
      let title = index === 0 ? "Prologue / Title Page" : lines[0].trim();
      let contentVi = index === 0 ? block.trim() : lines.slice(1).join('\n').trim();

      // Generate a clean ID
      const chapterId = `ch_${crypto.randomBytes(4).toString('hex')}`;

      const chapterData = {
        id: chapterId,
        order: index,
        title: title,
        year: 'Unknown', // Need English translations or LLM parser to extract year context
        contentVi: contentVi,
        contentEn: '', // To be filled by translations later
        annotations: [], // Placeholder for typed mappings
        createdAt: new Date().toISOString()
      };

      chapters.push(chapterData);

      const chapterRef = adminDb.collection("chapters").doc(chapterId);
      batch.set(chapterRef, chapterData);
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully parsed ${chapters.length} chapters into Firestore!`
    });
    
  } catch (e: any) {
    console.error("Parse Error:", e);
    return NextResponse.json({ 
        success: false, 
        error: e.message || 'Unknown Server Error',
        stack: e.stack
    }, { status: 500 });
  }
}
