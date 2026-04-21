import React from 'react';
import { MessageSquarePlus, Edit3, Quote, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Chapter } from '../types';

interface DistantVoicesProps {
  chapters: Chapter[];
  onAnnotate: (targetId?: string) => void;
  activeAnnotationId?: string;
}

export default function DistantVoices({ chapters, onAnnotate, activeAnnotationId }: DistantVoicesProps) {
  const voices = chapters.flatMap(ch => 
    (ch.annotations || [])
      .filter(a => !a.targetId && a.status === 'approved')
      .map(a => ({ ...a, chapterId: ch.id, chapterTitle: ch.title }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="h-full bg-surface text-on-surface overflow-x-hidden overflow-y-auto pt-24 pb-40 px-4 md:px-0">
      <div className="max-w-3xl mx-auto w-full relative">
        {/* HEADER */}
        <div className="mb-16 ml-[32px] md:ml-[60px]">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary block mb-2">
            Overarching Insights
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-semibold text-on-surface tracking-tight">
            Distant Voices
          </h2>
          <p className="font-body text-outline mt-4 leading-relaxed max-w-xl">
             These are the macro-scale memories, holistic reflections, and conceptual context that bounds the archive, detached from strict epochs.
          </p>
        </div>

        {/* CONTAINER */}
        <div className="relative w-full">
          {/* THE SPINE */}
          <div className="absolute left-[32px] md:left-[60px] top-4 bottom-[-40px] w-[1px] bg-gradient-to-b from-primary via-secondary to-surface opacity-80" />

          {/* EVENTS LIST */}
          <div className="w-full flex flex-col gap-10">
            {voices.length === 0 ? (
              <div className="ml-[64px] md:ml-[110px] p-12 border border-outline-variant rounded-3xl text-center space-y-4 bg-surface-container-low">
                <Quote className="w-12 h-12 mx-auto text-outline/20" />
                <p className="font-body text-lg italic text-outline">No distant voices have echoed here yet.</p>
              </div>
            ) : (
              voices.map((v, index) => {
                const isActive = activeAnnotationId === v.id;

                return (
                  <motion.div 
                    key={v.id}
                    id={v.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className={cn(
                      "relative w-full flex items-start group",
                    )}
                  >
                    {/* TIMELINE NODE (Dot) */}
                     <div className={cn(
                        "absolute left-[32px] md:left-[60px] top-[24px] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-surface ring-2 z-10 transition-transform group-hover:scale-125",
                        isActive ? "bg-secondary border-secondary shadow-[0_0_15px_rgba(209,125,86,0.5)]" : "bg-secondary border-surface ring-secondary/30"
                     )} />

                    {/* CARD CONTENT */}
                    <div className={cn(
                      "ml-[64px] md:ml-[110px] w-full max-w-2xl bg-surface-container-low rounded-3xl border p-6 md:p-8 transition-colors shadow-lg",
                      isActive ? "border-secondary/50 bg-surface-container" : "border-outline-variant hover:bg-surface-container"
                    )}>
                      
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="font-headline text-xl md:text-2xl text-on-surface font-semibold tracking-tight italic">
                           "{v.content}"
                        </h3>
                        {v.historicalDate && (
                           <div className="shrink-0 font-label text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full bg-secondary-container text-secondary">
                             {new Date(v.historicalDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                           </div>
                        )}
                      </div>

                      {/* Metrics / Metadata Grid */}
                      <div className="mt-8 flex flex-wrap items-center gap-8 border-t border-outline-variant pt-4 relative">
                        <div className="flex flex-col gap-1">
                           <span className="font-label text-[8px] uppercase tracking-widest text-outline/60">Transmission Auth</span>
                           <span className="font-label text-xs font-medium text-secondary">{v.author}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="font-label text-[8px] uppercase tracking-widest text-outline/60">Sector</span>
                           <span className="font-label text-xs font-medium text-outline">{v.chapterTitle}</span>
                        </div>
                        
                        <button 
                          onClick={() => onAnnotate(v.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity font-label text-[10px] uppercase tracking-widest font-bold text-primary hover:text-on-surface flex items-center gap-2"
                          title="Reply to this voice"
                        >
                          <MessageSquarePlus className="w-3 h-3" /> Reply
                        </button>
                      </div>

                      {/* Echoes / Replies */}
                      {v.replies && v.replies.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-outline-variant space-y-4">
                          {v.replies.filter(r => r.status === 'approved').map(reply => (
                            <div key={reply.id} className="bg-surface p-4 rounded-xl border border-outline-variant">
                              <p className="font-body text-outline leading-relaxed italic mb-2">"{reply.content}"</p>
                              <p className="font-label text-[10px] text-primary uppercase tracking-widest">— {reply.author}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => onAnnotate()}
        className="fixed bottom-24 right-8 md:right-16 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-lg z-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-secondary"
        title="Add a Distant Voice"
      >
        <Edit3 className="w-6 h-6" />
      </button>
    </div>
  );
}
