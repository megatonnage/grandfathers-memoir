import React from 'react';
import { History, MessageSquarePlus, Edit3, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Chapter, Annotation } from '../types';

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
    <div className="h-full bg-primary-container text-on-primary overflow-y-auto pt-24 pb-32 px-8 relative">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <span className="font-label text-sm uppercase tracking-[0.3em] text-on-primary/60 block">
            Overarching Insights & Reflections
          </span>
          <h2 className="text-5xl font-headline italic leading-tight">
            Distant <span className="text-on-tertiary-container">Voices</span>
          </h2>
          <p className="font-body text-xl text-on-primary/80 max-w-2xl leading-relaxed">
            These are the overarching memories, broad stories, and contexts that envelop the chapter as a whole, untethered from a specific sentence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {voices.length === 0 ? (
            <div className="p-12 border border-on-primary/10 rounded-xl text-center space-y-4 bg-primary/20">
              <Quote className="w-12 h-12 mx-auto text-on-primary/30" />
              <p className="font-body text-lg italic text-on-primary/60">No distant voices have echoed here yet.</p>
            </div>
          ) : (
            voices.map((v, index) => {
              const isActive = activeAnnotationId === v.id;

              return (
                <motion.article 
                  key={v.id}
                  id={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-8 md:p-10 relative overflow-hidden border transition-all duration-300 group rounded-2xl",
                    isActive 
                      ? "bg-primary/40 border-on-tertiary-container shadow-[0_0_30px_rgba(244,136,121,0.2)]" 
                      : "bg-primary/20 border-on-primary/10 hover:bg-primary/30"
                  )}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Quote className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <span className="font-label text-[10px] text-on-primary/40 block mb-1 uppercase tracking-widest">Voice</span>
                        <p className="font-label text-sm font-bold text-on-tertiary-container">{v.author}</p>
                      </div>
                      <div>
                        <span className="font-label text-[10px] text-on-primary/40 block mb-1 uppercase tracking-widest">Transmission Sector</span>
                        <p className="font-label text-sm font-bold">{v.chapterTitle}</p>
                      </div>
                      {v.historicalDate && (
                        <div>
                          <span className="font-label text-[10px] text-on-primary/40 block mb-1 uppercase tracking-widest">Timeline Anchor</span>
                          <p className="font-label text-sm font-bold">{new Date(v.historicalDate + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-label text-[10px] text-on-primary/40 block mb-1 uppercase tracking-widest">Transmission Date</span>
                        <p className="font-label text-sm font-bold">{new Date(v.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-on-primary/10" />

                    <div className="relative">
                      <p className="font-headline text-2xl leading-relaxed italic text-on-primary/90">
                        "{v.content}"
                      </p>
                      <button 
                        onClick={() => onAnnotate(v.id)}
                        className="absolute -right-4 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-on-tertiary-container text-primary rounded-full shadow-lg hover:scale-105 active:scale-95 font-label text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                        title="Reply to this voice"
                      >
                        <MessageSquarePlus className="w-4 h-4" /> Reply
                      </button>
                    </div>

                    {v.replies && v.replies.length > 0 && (
                      <div className="pt-6 border-t border-on-primary/10 space-y-4">
                        <span className="font-label text-[10px] text-on-primary/40 uppercase tracking-widest font-bold">Echoes</span>
                        {v.replies.filter(r => r.status === 'approved').map(reply => (
                          <div key={reply.id} className="bg-primary/30 p-4 rounded-xl border border-on-primary/5">
                            <p className="font-body text-sm italic text-on-primary/80 mb-2">"{reply.content}"</p>
                            <p className="font-label text-xs text-on-tertiary-container">— {reply.author}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })
          )}
        </div>
      </div>

      <button 
        onClick={() => onAnnotate()}
        className="fixed bottom-24 right-8 w-14 h-14 bg-on-tertiary-container text-primary rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
        title="Add a Distant Voice"
      >
        <Edit3 className="w-6 h-6" />
      </button>
    </div>
  );
}
