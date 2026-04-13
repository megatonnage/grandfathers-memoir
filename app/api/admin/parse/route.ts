import { NextResponse } from 'next/server';
import { adminStorage, adminDb } from '../../../../lib/firebase-admin';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileName = body.fileName || "Ong's Book.md";
    const isTranslation = body.isTranslation === true;

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

    if (isTranslation) {
      // Fetch structural timeline
      const snapshot = await adminDb.collection("chapters").orderBy("order", "asc").get();
      const existingChapters = snapshot.docs;

      let blockIndex = 0;
      chapterBlocks.forEach((block) => {
        if (!block.trim()) return;

        const lines = block.split('\n');
        // Extract translation payload
        let contentEn = blockIndex === 0 ? block.trim() : lines.slice(1).join('\n').trim();

        if (blockIndex < existingChapters.length) {
          const docRef = adminDb.collection("chapters").doc(existingChapters[blockIndex].id);
          batch.update(docRef, { contentEn });
        }
        blockIndex++;
      });
      await batch.commit();

      return NextResponse.json({ 
        success: true, 
        message: `Successfully mapped translation to ${blockIndex} existing chapters!`
      });

    } else {
      const chapters: any[] = [];
      chapterBlocks.forEach((block, index) => {
        if (!block.trim()) return;

        const lines = block.split('\n');
        let title = index === 0 ? "Prologue / Title Page" : lines[0].trim();
        let contentVi = index === 0 ? block.trim() : lines.slice(1).join('\n').trim();

        const chapterId = `ch_${crypto.randomBytes(4).toString('hex')}`;

        const chapterData = {
          id: chapterId,
          order: index,
          title: title,
          year: 'Unknown',
          contentVi: contentVi,
          contentEn: '', 
          annotations: [], 
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
    }
    
  } catch (e: any) {
    console.error("Parse Error:", e);
    return NextResponse.json({ 
        success: false, 
        error: e.message || 'Unknown Server Error',
        stack: e.stack
    }, { status: 500 });
  }
}
