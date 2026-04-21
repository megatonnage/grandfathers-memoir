"use client";

import React, { useState } from 'react';
import { Search, CornerDownRight, BookOpen, Quote, Maximize2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chapter, GalleryImage } from '../types';

interface TimelineViewProps {
  chapters: Chapter[];
  galleryImages: GalleryImage[];
  onNavigateToChapter: (index: number, evType?: string, targetId?: string) => void;
}

export default function TimelineView({ chapters, galleryImages, onNavigateToChapter }: TimelineViewProps) {
  // Combine and sort all events for a unified timeline
  const timelineEvents = React.useMemo(() => {
    let events: any[] = [];
    
    chapters.forEach((chapter, index) => {
      // Treat the chapter itself as a major un-dated (or inferred epoch) node
      events.push({
        type: 'chapter',
        id: chapter.id,
        title: chapter.title,
        content: chapter.contentEn?.replace(/[#*]/g, '').substring(0, 200) + '...',
        author: 'Grandfather',
        epochIndex: index,
        sortDate: (chapter as any).timestamp || new Date(2000, index, 1).toISOString(), // fallback
      });

      // Add their approved tributaries
      if (chapter.annotations) {
        chapter.annotations.filter(a => a.status === 'approved').forEach(ann => {
          const isVoice = !ann.targetId;
          events.push({
            type: isVoice ? 'voice' : 'annotation',
            id: ann.id,
            title: isVoice ? 'Distant Voice' : 'Text Annotation',
            content: ann.content,
            author: ann.author,
            historicalDate: ann.historicalDate, // MM-YYYY
            sortDate: ann.historicalDate ? new Date(ann.historicalDate + '-01').toISOString() : ann.timestamp,
            targetChapter: index,
            targetNodeId: ann.targetId
          });
        });
      }
    });
    // Add Gallery items and their annotations
    galleryImages.forEach(img => {
       // The image upload itself isn't necessarily a timeline event, but its annotations are.
       // However, we can treat the photo upload as an event too:
       events.push({
          type: 'photo',
          id: img.id,
          title: 'Visual Artifact',
          content: img.caption || 'A photo was added to the repository.',
          author: img.uploadedBy,
          historicalDate: img.historicalDate,
          sortDate: img.historicalDate ? new Date(img.historicalDate + '-01').toISOString() : img.uploadedAt,
          url: img.url
       });

       if (img.annotations) {
          img.annotations.filter(a => a.status === 'approved' || true).forEach(ann => {
             events.push({
                type: 'photo_annotation',
                id: ann.id,
                title: 'Artifact Reflection',
                content: ann.content,
                author: ann.author,
                sortDate: ann.timestamp,
                targetNodeId: `img-${img.id}`
             });
          });
       }
    });

    return events.sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
  }, [chapters, galleryImages]);

  return (
    <div className="h-full bg-surface text-on-surface overflow-x-hidden overflow-y-auto pt-24 pb-40 px-4 md:px-0">
      
      <div className="max-w-3xl mx-auto w-full relative">
        {/* HEADER */}
        <div className="mb-16 ml-[32px] md:ml-[60px]">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary block mb-2">
            Data Log: 1954 — 2024
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-semibold text-on-surface tracking-tight">
            Subject: Living Archive
          </h2>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative w-full">
          {/* THE SPINE (Left Line) */}
          <div className="absolute left-[32px] md:left-[60px] top-4 bottom-[-40px] w-[1px] bg-gradient-to-b from-secondary via-primary to-secondary/30 opacity-80" />

          {/* EVENTS LIST */}
          <div className="w-full flex flex-col gap-10">
            {timelineEvents.map((ev, index) => {
              const isChapter = ev.type === 'chapter';
              const isVoice = ev.type === 'voice';
              const isPhoto = ev.type === 'photo';
              const isPhotoAnn = ev.type === 'photo_annotation';
              
              // Colors based on type
              const dotColor = isChapter ? 'bg-primary' : (isVoice ? 'bg-secondary' : (isPhoto || isPhotoAnn ? 'bg-secondary/70' : 'bg-outline'));
              const ringColor = isChapter ? 'border-primary/30' : (isVoice ? 'border-secondary/30' : 'border-outline/30');
              const badgeBg = isChapter ? 'bg-primary-container' : (isVoice ? 'bg-secondary-container' : 'bg-surface-container-high');
              const badgeText = isChapter ? 'text-primary' : (isVoice ? 'text-secondary' : 'text-outline');

              // Format dates nicely
              const renderDate = () => {
                if (ev.historicalDate) {
                  const d = new Date(ev.historicalDate + '-01');
                  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
                }
                if (isChapter) return `EPOCH 0${ev.epochIndex + 1}`;
                return new Date(ev.sortDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
              };

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  key={ev.id + index} 
                  className={`relative w-full flex items-start group ${isChapter ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                     if (isChapter) onNavigateToChapter(ev.epochIndex, 'chapter', ev.id);
                     if (!isChapter && ev.targetChapter !== undefined) onNavigateToChapter(ev.targetChapter, ev.type, ev.targetNodeId || ev.id);
                  }}
                >
                  {/* TIMELINE NODE (Dot) */}
                  <div className={`absolute left-[32px] md:left-[60px] top-[24px] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${dotColor} border-[3px] border-surface ring-2 ${ringColor} z-10 transition-transform group-hover:scale-125`} />

                  {/* CARD CONTENT */}
                  <div className="ml-[64px] md:ml-[110px] w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant p-6 md:p-8 hover:bg-surface-container transition-colors shadow-lg">
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h3 className="font-headline text-xl md:text-2xl text-on-surface font-semibold tracking-tight">
                        {ev.title}
                      </h3>
                      <div className={`shrink-0 font-label text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full ${badgeBg} ${badgeText}`}>
                        {renderDate()}
                      </div>
                    </div>

                    {/* Body Text */}
                    <p className={`font-body text-outline leading-relaxed ${isChapter ? 'text-sm md:text-base' : 'italic text-sm md:text-base'}`}>
                      {isChapter ? ev.content : `"${ev.content}"`}
                    </p>

                    {/* Metrics / Metadata Grid */}
                    <div className="mt-6 flex flex-wrap items-center gap-8 border-t border-outline-variant pt-4">
                      {(isPhoto && ev.url) && (
                        <div className="w-full mb-4">
                          <img src={ev.url} alt="Artifact" className="h-48 w-full object-cover rounded-xl border border-outline-variant" />
                        </div>
                      )}
                      
                      {isChapter ? (
                         <>
                            <div className="flex flex-col gap-1">
                               <span className="font-label text-[8px] uppercase tracking-widest text-outline/60">Identifier</span>
                               <span className="font-label text-xs text-primary font-medium">Main Current</span>
                            </div>
                            <div className="flex flex-col gap-1">
                               <span className="font-label text-[8px] uppercase tracking-widest text-outline/60">Action</span>
                               <span className="font-label text-xs text-outline group-hover:text-on-surface transition-colors">Enter Stream →</span>
                            </div>
                         </>
                      ) : (
                         <>
                            <div className="flex flex-col gap-1">
                               <span className="font-label text-[8px] uppercase tracking-widest text-outline/60">Transmission Auth</span>
                               <span className={`font-label text-xs font-medium ${isVoice ? 'text-secondary' : 'text-outline'}`}>{ev.author}</span>
                            </div>
                         </>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Floating Bottom action bar (matching prototype UI slightly) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface-container border border-outline-variant px-8 py-4 rounded-full shadow-lg flex items-center gap-8 z-50">
         <BookOpen className="w-5 h-5 text-primary cursor-pointer" />
         <Search className="w-5 h-5 text-outline cursor-pointer hover:text-on-surface" />
      </div>
    </div>
  );
}
