import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Chapter } from '../types';
import { cn } from '../lib/utils';
import { MessageSquarePlus, ChevronLeft, ChevronRight, BookOpen, Heart } from 'lucide-react';

interface BilingualReaderProps {
  chapter: Chapter;
  chapters: Chapter[];
  onAnnotate: (targetId: string) => void;
  onChapterChange: (chapterId: string) => void;
  activeAnnotationId?: string;
}

const markdownComponents = {
  img: (props: any) => (
    <span className="flex flex-col my-8 p-1.5 bg-white shadow-md transform rotate-1 hover:rotate-0 transition-all border border-outline-variant max-w-[85%] mx-auto">
      <img 
        {...props} 
        className="w-full h-auto rounded-sm grayscale-[0.25] sepia-[0.15]"
        referrerPolicy="no-referrer"
      />
      {props.alt && (
        <span className="p-3 block border-t border-outline-variant/30 mt-1.5 bg-surface-container-low/50">
          <span className="font-label text-[12px] text-primary/80 italic font-medium text-center block">
            {props.alt}
          </span>
        </span>
      )}
    </span>
  )
};

export default function BilingualReader({ chapter, chapters, onAnnotate, onChapterChange, activeAnnotationId }: BilingualReaderProps) {
  const [showChapterNav, setShowChapterNav] = useState(false);
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

  const currentIndex = chapters.findIndex(c => c.id === chapter.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  const handlePrev = () => {
    if (hasPrev) onChapterChange(chapters[currentIndex - 1].id);
  };

  const handleNext = () => {
    if (hasNext) onChapterChange(chapters[currentIndex + 1].id);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden pt-16">
      {/* Chapter Navigation Bar */}
      <div className="bg-surface-container border-b border-outline-variant px-4 py-3 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-md font-label text-sm transition-colors",
            hasPrev ? "text-on-surface hover:bg-surface-container-high" : "text-outline/30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={() => setShowChapterNav(!showChapterNav)}
          className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-outline-variant hover:border-primary/30 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-label text-sm text-on-surface">
            {currentIndex + 1} of {chapters.length}: {chapter.title}
          </span>
        </button>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-md font-label text-sm transition-colors",
            hasNext ? "text-on-surface hover:bg-surface-container-high" : "text-outline/30 cursor-not-allowed"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Chapter Selector Dropdown */}
      {showChapterNav && (
        <div className="bg-surface-container border-b border-outline-variant px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-outline font-label mb-2">Jump to chapter:</p>
            <div className="flex flex-wrap gap-2">
              {chapters.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onChapterChange(c.id);
                    setShowChapterNav(false);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-label text-sm transition-colors",
                    c.id === chapter.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface text-on-surface hover:bg-surface-container-high border border-outline-variant"
                  )}
                >
                  {idx + 1}. {c.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Panes */}
      <div className="flex flex-1 overflow-hidden">
      {/* Left Pane: Vietnamese */}
      <div 
        ref={leftRef}
        onScroll={() => handleScroll(leftRef, rightRef)}
        className="w-1/2 h-full bg-surface overflow-y-auto hide-scrollbar px-8 py-12 border-r border-outline-variant relative"
      >
        <div className="max-w-xl mx-auto space-y-8">
          <div className="inline-block border-b-2 border-primary/40 pb-1 mb-6">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/60 font-semibold">
              Bản Gốc • Vietnamese
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
                    <ReactMarkdown components={markdownComponents}>{p.replace(/\n/g, '  \n')}</ReactMarkdown>
                  </div>
                      {hasAnnotation && (
                    <div className="absolute -right-4 top-2 p-1 text-primary" title="This paragraph has annotations">
                      <Heart className="w-4 h-4 fill-primary" />
                    </div>
                  )}
                  <button 
                    onClick={() => onAnnotate(pId)}
                    className="absolute -right-4 top-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary text-on-primary rounded-sm shadow-lg hover:scale-110"
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
              Translation • English
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
                  <div className="prose prose-stone max-w-none font-sans text-[17px] leading-relaxed text-on-surface/75">
                    <ReactMarkdown components={markdownComponents}>{p.replace(/\n/g, '  \n')}</ReactMarkdown>
                  </div>
                  {hasAnnotation && (
                    <div className="absolute -right-4 top-2 p-1 text-primary" title="This paragraph has annotations">
                      <Heart className="w-4 h-4 fill-primary" />
                    </div>
                  )}
                  <button 
                    onClick={() => onAnnotate(pId)}
                    className="absolute -right-4 top-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-primary text-on-primary rounded-sm shadow-lg hover:scale-110"
                    title="Annotate this translation"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
