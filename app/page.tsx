'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Layer definitions matching the spec
const rightLayers = [
  { id: 'bridge', name: 'Bridge', icon: '🌉', theme: 'layer-bridge', desc: "Literal Translation" },
  { id: 'witness', name: 'Witness', icon: '👁️', theme: 'layer-witness', desc: "Personal Reflection" },
  { id: 'chorus', name: 'Chorus', icon: '👥', theme: 'layer-chorus', desc: "Family Contributions" },
  { id: 'futures', name: 'Futures', icon: '✨', theme: 'layer-futures', desc: "Descendants' Voices" },
];

export default function Home() {
  const [activeLayer, setActiveLayer] = useState('bridge');
  const [activeSegmentId, setActiveSegmentId] = useState(0);
  
  // Chapter Navigation State
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapterId, setActiveChapterId] = useState('01-early-years');
  const [contentSegments, setContentSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentTheme = rightLayers.find(l => l.id === activeLayer)?.theme || 'layer-bridge';

  // Fetch Chapter Metadata
  useEffect(() => {
    fetch('/api/chapters')
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.length > 0) {
          setChapters(data);
        }
      });
  }, []);

  // Fetch Content Data whenever the Active Chapter changes
  useEffect(() => {
    if (!activeChapterId) return;
    setIsLoading(true);
    fetch(`/api/chapters/${activeChapterId}/content`)
      .then(res => res.json())
      .then(data => {
        setContentSegments(data);
        if (data.length > 0) {
          setActiveSegmentId(data[0].id);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setContentSegments([]);
        setIsLoading(false);
      });
  }, [activeChapterId]);

  const activeChapterData = chapters.find(c => c.id === activeChapterId);

  return (
    <main className={`min-h-screen flex flex-col md:flex-row bg-[#ECECEA]`}>
      
      {/* 
        LEFT COLUMN (PERSISTENT): Layer 1 (Original)
      */}
      <div className="w-full md:w-1/2 min-h-screen overflow-y-auto pb-32 border-r border-[#black/10] layer-original">
        <div className="max-w-xl mx-auto px-6 py-12">
          
          <header className="mb-12 border-b border-black/10 pb-6 opacity-70 relative group">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl uppercase tracking-widest font-sans">The Living Archive</h2>
              <Link href="/admin" className="text-xs uppercase font-sans border border-black/20 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5">
                Admin Portal
              </Link>
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <select 
                 className="appearance-none bg-transparent text-3xl font-serif border-b-2 border-transparent hover:border-black/20 focus:outline-none focus:border-black/40 transition-colors w-full cursor-pointer pb-2 mb-2"
                 value={activeChapterId}
                 onChange={(e) => setActiveChapterId(e.target.value)}
              >
                <option value="01-early-years" disabled className="text-sm font-sans">Select a Chapter...</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id} className="text-base font-sans">
                    Chapter {ch.order}: {ch.title} ({ch.dateRange})
                  </option>
                ))}
              </select>
              <div className="absolute right-0 top-3 pointer-events-none opacity-50 text-xs">▼</div>
              
              {activeChapterData && (
                <p className="font-sans text-sm tracking-wide uppercase opacity-70">
                  {activeChapterData.subtitle}
                </p>
              )}
            </div>
          </header>
          
          <div className={`space-y-6 relative transition-opacity duration-500 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-black/5 to-transparent rounded-full" />
            
            {contentSegments.map((segment) => (
              <p 
                key={segment.id}
                onClick={() => setActiveSegmentId(segment.id)}
                className={`text-lg leading-relaxed cursor-pointer transition-all duration-300 p-4 rounded-xl relative ${
                  activeSegmentId === segment.id 
                    ? 'bg-black/5 ring-1 ring-black/20 shadow-sm opacity-100 scale-[1.02] z-10' 
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5 hover:translate-x-1'
                }`}
              >
                {segment.original}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 
        RIGHT COLUMN (DYNAMIC LAYER CONTENT)
      */}
      <div className={`w-full md:w-1/2 min-h-screen overflow-y-auto pb-32 transition-colors duration-500 ${currentTheme}`}>
        <div className="max-w-xl mx-auto px-6 py-12">
          <header className={`mb-12 border-b border-current/20 pb-6 mix-blend-luminosity transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-70'}`}>
            <h2 className="text-xl uppercase tracking-widest mb-2 flex items-center font-sans">
              <span className="mr-2 text-2xl">{rightLayers.find(l => l.id === activeLayer)?.icon}</span>
              {rightLayers.find(l => l.id === activeLayer)?.name} Layer
            </h2>
            <p className="text-sm opacity-70 font-sans tracking-wide">
              {rightLayers.find(l => l.id === activeLayer)?.desc}
            </p>
          </header>

          <div className="space-y-6 text-lg leading-relaxed opacity-90 transition-opacity">
            {/* Find the specific segment data */}
            {(() => {
              if (isLoading) return null;
              
              const activeSegment = contentSegments.find(s => s.id === activeSegmentId);
              if (!activeSegment) return null;

              if (activeLayer === 'bridge') {
                return <p>{activeSegment.layers.bridge}</p>;
              }
              if (activeLayer === 'witness') {
                return <p className="italic">{activeSegment.layers.witness}</p>;
              }
              if (activeLayer === 'chorus') {
                return (
                  <div className="space-y-6">
                    {activeSegment.layers.chorus.length > 0 ? (
                      activeSegment.layers.chorus.map((comment: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-emerald-700 pl-4 opacity-80 backdrop-blur-sm p-4 rounded-r-lg bg-emerald-900/5 text-base">
                          <p className="font-semibold text-lg mb-1">{comment.author}:</p>
                          <p>{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="opacity-50 italic">No family contributions for this segment yet.</p>
                    )}
                  </div>
                );
              }
              if (activeLayer === 'futures') {
                return (
                  <div className="opacity-80 break-words whitespace-pre-wrap font-mono text-sm">
                    {activeSegment.layers.futures}
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {/* Futuristic Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full p-4 flex justify-center pb-8 transition-colors z-50 pointer-events-none">
        <div className="flex gap-4 sm:gap-6 bg-black/80 p-2 rounded-2xl backdrop-blur-2xl border border-white/20 shadow-2xl pointer-events-auto">
          {rightLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 w-20 sm:w-24 ${
                activeLayer === layer.id 
                  ? 'bg-white text-black scale-105 shadow-md shadow-white/10' 
                  : 'hover:bg-white/20 text-white/50 hover:text-white'
              }`}
            >
              <span className="text-xl mb-1 drop-shadow-md">{layer.icon}</span>
              <span className={`text-[10px] font-bold tracking-wider uppercase ${activeLayer === layer.id ? 'text-black' : ''}`}>
                {layer.name}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
