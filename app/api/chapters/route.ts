import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const metaPath = path.join(process.cwd(), 'chapters', '_meta.json');
  try {
    const data = await fs.readFile(metaPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Could not read _meta.json' }, { status: 500 });
  }
}
