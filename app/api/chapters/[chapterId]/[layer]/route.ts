import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const fileMap: Record<string, string> = {
  original: 'layer-1-original.md',
  translation: 'layer-2-translation.md',
  witness: 'layer-3-witness.md',
  chorus: 'layer-4-chorus.json',
  futures: 'layer-5-futures.json'
};

export async function GET(request: NextRequest, { params }: { params: { chapterId: string, layer: string } }) {
  const { chapterId, layer } = params;
  
  const filename = fileMap[layer];
  if (!filename) return NextResponse.json({ error: 'Invalid layer' }, { status: 400 });

  const filePath = path.join(process.cwd(), 'chapters', chapterId, filename);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return NextResponse.json({ content: data });
  } catch (error) {
    // Return empty if file doesn't exist yet
    return NextResponse.json({ content: '' });
  }
}

export async function POST(request: NextRequest, { params }: { params: { chapterId: string, layer: string } }) {
  const { chapterId, layer } = params;
  const { content } = await request.json();

  const filename = fileMap[layer];
  if (!filename) return NextResponse.json({ error: 'Invalid layer' }, { status: 400 });

  const dirPath = path.join(process.cwd(), 'chapters', chapterId);
  const filePath = path.join(dirPath, filename);
  
  try {
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Could not write file' }, { status: 500 });
  }
}
