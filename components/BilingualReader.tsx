import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Chapter } from '../types';
import { cn } from '../lib/utils';
import { MessageSquarePlus } from 'lucide-react';

interface BilingualReaderProps {
  chapter: Chapter;
  onAnnotate: (targetId: string) => void;
  activeAnnotationId?: string;
}

export default function BilingualReader({ chapter, onAnnotate, activeAnnotationId }: BilingualReaderProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  const handleScroll = (source: React.RefObject<HTMLDivElement>, target: React.RefObject<HTMLDivElement>) => {
    if (!source.current || !target.current || isSyncing.current) return;

    isSyncing.current = true;
    const scrollPercentage = source.current.scrollTop / (source.current.scrollHeight - source.current.clientHeight);
    target.current.scrollTop = scrollPercentage * (target.current.scrollHeight - target.current.clientHeight);
    
    setTimeout(() => {
      isSyncing.current = false;
    }, 50);
  };

  // Split content into paragraphs for interactive selection
  const paragraphsVi = chapter.contentVi.split('\n\n');
  const paragraphsEn = chapter.contentEn.split('\n\n');

  return (
    <div className="flex h-full overflow-hidden pt-16">
      {/* Left Pane: Vietnamese */}
      <div 
        ref={leftRef}
        onScroll={() => handleScroll(leftRef, rightRef)}
        className="w-1/2 h-full bg-surface overflow-y-auto hide-scrollbar px-8 py-12 border-r border-outline-variant relative"
      >
        <div className="max-w-xl mx-auto space-y-8">
          <div className="inline-block border-b-2 border-primary/40 pb-1 mb-6">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/60 font-semibold">
              Bản Gốc • {chapter.year}
            </span>
          </div>
          <h2 className="text-3xl font-headline font-bold text-on-surface leading-tight">
            {chapter.title}
          </h2>
          
          <div className="space-y-8">
            {paragraphsVi.map((p, idx) => {
              const pId = `p${idx + 1}`;
              const hasAnnotation = chapter.annotations.some(a => a.targetId === pId);
              const isActive = activeAnnotationId === pId;

              return (
                <div 
                  key={pId} 
                  id={pId}
                  className={cn(
                    "group relative p-2 -m-2 rounded-sm transition-all duration-300",
                    hasAnnotation && "bg-primary/5 border-l-2 border-primary/20",
                    isActive && "bg-primary/10 border-l-2 border-primary"
                  )}
                >
                  <div className="prose prose-stone max-w-none font-headline text-xl leading-relaxed text-on-surface/90">
                    <ReactMarkdown>{p}</ReactMarkdown>
                  </div>
                  <button 
                    onClick={() => onAnnotate(pId)}
                    className="absolute -right-4 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary text-on-primary rounded-sm shadow-lg hover:scale-110"
                    title="Annotate this paragraph"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {chapter.image && (
            <div className="my-12 p-1.5 bg-white rounded-sm shadow-md transform -rotate-1 border border-outline-variant">
              <img 
                src={chapter.image} 
                alt={chapter.imageCaption} 
                className="w-full h-auto rounded-sm grayscale-[0.2] sepia-[0.1]"
                referrerPolicy="no-referrer"
              />
              <div className="p-3">
                <p className="font-label text-[11px] text-primary italic font-medium">
                  {chapter.imageCaption}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: English */}
      <div 
        ref={rightRef}
        onScroll={() => handleScroll(rightRef, leftRef)}
        className="w-1/2 h-full bg-surface-container overflow-y-auto hide-scrollbar px-8 py-12 relative"
      >
        <div className="max-w-xl mx-auto space-y-8">
          <div className="inline-block border-b-2 border-primary/20 pb-1 mb-6">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-semibold">
              Translation • Legacy
            </span>
          </div>
          <h2 className="text-3xl font-headline font-light italic text-primary/80 leading-tight">
            {chapter.title}
          </h2>
          
          <div className="space-y-8">
            {paragraphsEn.map((p, idx) => {
              const pId = `en-p${idx + 1}`;
              const hasAnnotation = chapter.annotations.some(a => a.targetId === pId);
              const isActive = activeAnnotationId === pId;

              return (
                <div 
                  key={pId} 
                  id={pId}
                  className={cn(
                    "group relative p-2 -m-2 rounded-sm transition-all duration-300",
                    hasAnnotation && "bg-primary/5 border-l-2 border-primary/20",
                    isActive && "bg-primary/10 border-l-2 border-primary"
                  )}
                >
                  <div className="prose prose-stone max-w-none font-headline text-xl leading-relaxed text-on-surface/70 italic">
                    <ReactMarkdown>{p}</ReactMarkdown>
                  </div>
                  <button 
                    onClick={() => onAnnotate(pId)}
                    className="absolute -right-4 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary text-on-primary rounded-sm shadow-lg hover:scale-110"
                    title="Annotate this translation"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="h-48 my-12 bg-surface rounded-sm flex items-center justify-center overflow-hidden border border-outline-variant shadow-inner opacity-60">
             <div className="text-primary/20 text-6xl">❧</div>
          </div>
        </div>
      </div>
    </div>
  );
}
