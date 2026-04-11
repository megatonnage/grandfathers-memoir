import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { chapterId: string } }) {
  const { chapterId } = params;
  const dirPath = path.join(process.cwd(), 'chapters', chapterId);

  // Helper to read file safely
  const readFileArray = async (filename: string, asJson = false) => {
    try {
      const data = await fs.readFile(path.join(dirPath, filename), 'utf8');
      if (asJson) {
        try {
          return JSON.parse(data);
        } catch {
          return Array.isArray(data) ? data : [];
        }
      }
      // For Markdown, split by double newline to get paragraphs, filter out empty
      return data.split('\n\n').map((s: string) => s.trim()).filter((s: string) => s);
    } catch {
      return [];
    }
  };

  const originalLines = await readFileArray('layer-1-original.md');
  const bridgeLines = await readFileArray('layer-2-translation.md');
  const witnessLines = await readFileArray('layer-3-witness.md');
  const chorusData = await readFileArray('layer-4-chorus.json', true);
  const futuresData = await readFileArray('layer-5-futures.json', true);

  // If there's no original text at all, maybe return an empty array
  if (!originalLines || originalLines.length === 0) {
    return NextResponse.json([{
      id: 0,
      original: "No original text uploaded yet. Please use the Admin Portal.",
      layers: { bridge: "", witness: "", chorus: [], futures: "" }
    }]);
  }

  // Zip them together into segments based on the length of Original Lines
  const segments = originalLines.map((originalText: string, index: number) => {
    return {
      id: index,
      original: originalText,
      layers: {
        bridge: bridgeLines[index] || "Translation pending...",
        witness: witnessLines[index] || "No reflection yet.",
        chorus: Array.isArray(chorusData) ? (chorusData[index] || []) : [],
        futures: Array.isArray(futuresData) ? (futuresData[index] || "Scanning temporal archives...") : "Scanning temporal archives..."
      }
    };
  });

  return NextResponse.json(segments);
}
