'use client';
import { useState, useEffect } from 'react';

export default function AdminPortal() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('original');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const layers = [
    { id: 'original', name: 'Original (MD)' },
    { id: 'translation', name: 'Bridge / Translation (MD)' },
    { id: 'witness', name: 'Witness (MD)' },
    { id: 'chorus', name: 'Chorus (JSON)' },
    { id: 'futures', name: 'Futures (JSON)' }
  ];

  // Fetch chapters on load
  useEffect(() => {
    fetch('/api/chapters')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setChapters(data);
          if (data.length > 0) setSelectedChapter(data[0].id);
        }
      });
  }, []);

  // Fetch content when chapter or layer changes
  useEffect(() => {
    if (!selectedChapter) return;
    setIsLoading(true);
    setStatus('');
    
    fetch(`/api/chapters/${selectedChapter}/${selectedLayer}`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setIsLoading(false);
      });
  }, [selectedChapter, selectedLayer]);

  const handleSave = async () => {
    setStatus('Saving...');
    try {
      const res = await fetch(`/api/chapters/${selectedChapter}/${selectedLayer}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setStatus('Saved successfully!');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Error saving content.');
      }
    } catch (e) {
      setStatus('Error saving content.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <header className="bg-gray-900 text-white px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wider uppercase">Living Archive Admin</h1>
            <p className="opacity-70 text-sm mt-1">Manage Chapter Markdown & JSON Layers</p>
          </div>
          <a href="/" target="_blank" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 text-white rounded transition">
            View Live Site ↗
          </a>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Chapter</label>
              <select 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
              >
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.order}. {ch.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Layer</label>
              <select 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(e.target.value)}
              >
                {layers.map(layer => (
                  <option key={layer.id} value={layer.id}>{layer.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Raw Content</label>
              {status && <span className={`text-sm font-semibold ${status.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{status}</span>}
            </div>
            <textarea 
              className={`w-full h-[500px] border border-gray-300 rounded-lg p-4 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50' : ''}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or write your Markdown or JSON here..."
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-black text-white hover:bg-gray-800 font-bold py-3 px-8 rounded-lg shadow-md transition-all active:scale-95"
            >
              Save Content to File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
