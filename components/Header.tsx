import React from 'react';
import { Layers, Search, Languages } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface/95 backdrop-blur-sm border-b border-outline-variant">
      <div className="flex items-center gap-3">
        <Layers className="text-primary w-6 h-6" />
        <h1 className="text-xl font-headline font-bold text-on-surface italic tracking-tight">
          The Living Archive
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="hover:text-primary transition-colors active:scale-95 duration-200">
          <Languages className="w-5 h-5" />
        </button>
        <button className="hover:text-primary transition-colors active:scale-95 duration-200">
          <Search className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
