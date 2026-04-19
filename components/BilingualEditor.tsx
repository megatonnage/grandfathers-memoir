'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Chapter } from '../types';
import { cn } from '../lib/utils';
import { Eye, Edit3, Save, X, ImagePlus } from 'lucide-react';

interface BilingualEditorProps {
  chapter: Chapter;
  onSave: (updates: { contentVi: string; contentEn: string }) => Promise<void>;
}

const markdownComponents = {
  img: (props: any) => (
    <span className="flex flex-col my-6 p-1.5 bg-white shadow-md border border-outline-variant max-w-[85%] mx-auto">
      <img 
        {...props} 
        className="w-full h-auto rounded-sm grayscale-[0.25] sepia-[0.15]"
        referrerPolicy="no-referrer"
      />
      {props.alt && (
        <span className="p-2 block border-t border-outline-variant/30 mt-1.5 bg-surface-container-low/50">
          <span className="font-label text-[11px] text-primary/80 italic text-center block">
            {props.alt}
          </span>
        </span>
      )}
    </span>
  )
};

export default function BilingualEditor({ chapter, onSave }: BilingualEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [contentVi, setContentVi] = useState(chapter.contentVi);
  const [contentEn, setContentEn] = useState(chapter.contentEn);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  // Track changes
  useEffect(() => {
    setHasChanges(contentVi !== chapter.contentVi || contentEn !== chapter.contentEn);
  }, [contentVi, contentEn, chapter]);

  // Sync scroll between panes
  const handleScroll = (source: React.RefObject<HTMLDivElement>, target: React.RefObject<HTMLDivElement>) => {
    if (!source.current || !target.current || isSyncing.current) return;

    isSyncing.current = true;
    const scrollPercentage = source.current.scrollTop / (source.current.scrollHeight - source.current.clientHeight);
    target.current.scrollTop = scrollPercentage * (target.current.scrollHeight - target.current.clientHeight);
    
    setTimeout(() => {
      isSyncing.current = false;
    }, 50);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await onSave({ contentVi, contentEn });
      setHasChanges(false);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setContentVi(chapter.contentVi);
    setContentEn(chapter.contentEn);
    setHasChanges(false);
  };

  // Split content for preview mode
  const paragraphsVi = contentVi.split('\n\n').filter(p => p.trim());
  const paragraphsEn = contentEn.split('\n\n').filter(p => p.trim());

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-surface-container border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <h2 className="font-headline text-lg font-bold text-on-surface">
            {chapter.title}
          </h2>
          <span className="text-sm text-outline font-label">{chapter.year}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center bg-surface rounded-lg p-1 border border-outline-variant">
            <button
              onClick={() => setMode('edit')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-label transition-all",
                mode === 'edit' 
                  ? "bg-primary text-on-primary" 
                  : "text-outline hover:text-on-surface"
              )}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-label transition-all",
                mode === 'preview' 
                  ? "bg-primary text-on-primary" 
                  : "text-outline hover:text-on-surface"
              )}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {/* Save/Discard */}
          {hasChanges && (
            <>
              <button
                onClick={handleDiscard}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-label text-outline hover:text-tertiary transition-colors"
              >
                <X className="w-4 h-4" />
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-on-primary rounded-md text-sm font-label hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Vietnamese Pane */}
        <div 
          ref={leftRef}
          onScroll={() => handleScroll(leftRef, rightRef)}
          className="w-1/2 h-full overflow-y-auto border-r border-outline-variant"
        >
          <div className="px-6 py-4">
            <div className="inline-block border-b-2 border-primary/40 pb-1 mb-4">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/60 font-semibold">
                Bản Gốc • Vietnamese
              </span>
            </div>

            {mode === 'edit' ? (
              <textarea
                value={contentVi}
                onChange={(e) => setContentVi(e.target.value)}
                className="w-full min-h-[600px] p-4 bg-surface-container-low rounded-lg border border-outline-variant font-headline text-lg leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nhập văn bản tiếng Việt..."
              />
            ) : (
              <div className="space-y-6">
                {paragraphsVi.map((p, idx) => (
                  <div 
                    key={`vi-${idx}`}
                    id={`p${idx + 1}`}
                    className="group relative p-2 -m-2 rounded-sm hover:bg-primary/5 transition-colors"
                  >
                    <div className="prose prose-stone max-w-none font-headline text-lg leading-relaxed text-on-surface/90">
                      <ReactMarkdown components={markdownComponents}>{p}</ReactMarkdown>
                    </div>
                    <span className="absolute -left-6 top-2 text-[10px] text-outline/50 font-label opacity-0 group-hover:opacity-100 transition-opacity">
                      ¶{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* English Pane */}
        <div 
          ref={rightRef}
          onScroll={() => handleScroll(rightRef, leftRef)}
          className="w-1/2 h-full overflow-y-auto bg-surface-container/30"
        >
          <div className="px-6 py-4">
            <div className="inline-block border-b-2 border-primary/20 pb-1 mb-4">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/50 font-semibold">
                Translation • English
              </span>
            </div>

            {mode === 'edit' ? (
              <textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full min-h-[600px] p-4 bg-surface-container-low rounded-lg border border-outline-variant font-sans text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter English translation..."
              />
            ) : (
              <div className="space-y-6">
                {paragraphsEn.map((p, idx) => (
                  <div 
                    key={`en-${idx}`}
                    id={`en-p${idx + 1}`}
                    className="group relative p-2 -m-2 rounded-sm hover:bg-primary/5 transition-colors"
                  >
                    <div className="prose prose-stone max-w-none font-sans text-base leading-relaxed text-on-surface/75">
                      <ReactMarkdown components={markdownComponents}>{p}</ReactMarkdown>
                    </div>
                    <span className="absolute -left-6 top-2 text-[10px] text-outline/50 font-label opacity-0 group-hover:opacity-100 transition-opacity">
                      ¶{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 bg-surface-container-low border-t border-outline-variant text-xs font-label text-outline flex items-center justify-between">
        <span>
          {paragraphsVi.length} paragraphs (VI) • {paragraphsEn.length} paragraphs (EN)
        </span>
        {hasChanges && (
          <span className="text-tertiary">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
