import React from 'react';
import { Radio, Cpu, History, MessageSquarePlus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Chapter } from '../types';

interface DistantVoicesProps {
  chapter: Chapter;
  onAnnotate: (targetId: string) => void;
  activeAnnotationId?: string;
}

export default function DistantVoices({ chapter, onAnnotate, activeAnnotationId }: DistantVoicesProps) {
  const transmissions = [
    {
      id: 't1',
      origin: 'X-7 Orbital Biosphere',
      sender: 'DESCENDANT_REF_4419',
      year: '2482',
      content: "We have inherited your silences. In the year 2482, the air is no longer a medium for breath, but a canvas for data. We live within the 'Chorus'—a collective consciousness built upon the bones of your final archives.",
      type: 'future'
    },
    {
      id: 't2',
      origin: 'The High Silt',
      sender: 'ANCIENT_ELDER',
      year: 'Ancient Past',
      content: "To those who walk the earth when the forests have forgotten my name: I write this not in ink, but in the rhythm of the tides. My hands have touched the same soil that now cushions your feet.",
      type: 'ancient'
    }
  ];

  return (
    <div className="h-full bg-primary-container text-on-primary overflow-y-auto pt-24 pb-32 px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-2">
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-on-primary/60 block">
            Transmission Sequence 09.2482.VOICES
          </span>
          <h2 className="text-5xl font-headline italic leading-tight">
            Distant <span className="text-on-tertiary-container">Voices</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {transmissions.map((t, index) => {
            const hasAnnotation = chapter.annotations.some(a => a.targetId === t.id);
            const isActive = activeAnnotationId === t.id;

            return (
              <motion.article 
                key={t.id}
                id={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={cn(
                  "p-8 md:p-12 relative overflow-hidden border transition-all duration-300 group",
                  isActive 
                    ? "bg-primary/40 border-on-tertiary-container shadow-[0_0_30px_rgba(244,136,121,0.2)]" 
                    : "bg-primary/20 border-on-primary/10 hover:bg-primary/30",
                  hasAnnotation && !isActive && "border-on-tertiary-container/30"
                )}
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  {t.type === 'future' ? <Cpu className="w-24 h-24" /> : <History className="w-24 h-24" />}
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <span className="font-label text-[10px] text-on-primary/40 block mb-1 uppercase tracking-widest">Origin</span>
                      <p className="font-label text-sm font-bold">{t.origin}</p>
                    </div>
                    <div>
                      <span className="font-label text-[10px] text-on-primary/40 block mb-1 uppercase tracking-widest">Sender</span>
                      <p className="font-label text-sm font-bold text-on-tertiary-container">{t.sender}</p>
                    </div>
                    <div>
                      <span className="font-label text-[10px] text-on-primary/40 block mb-1 uppercase tracking-widest">Epoch</span>
                      <p className="font-label text-sm font-bold">{t.year}</p>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-on-primary/10" />

                  <div className="relative">
                    <p className="font-headline text-2xl leading-relaxed italic text-on-primary/90">
                      "{t.content}"
                    </p>
                    <button 
                      onClick={() => onAnnotate(t.id)}
                      className="absolute -right-4 -top-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-on-tertiary-container text-primary rounded-full shadow-lg hover:scale-110 active:scale-95"
                      title="Annotate this transmission"
                    >
                      <MessageSquarePlus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" />
                      <span className="font-label text-[10px] text-on-tertiary-container uppercase tracking-widest font-bold">
                        Signal Verified
                      </span>
                    </div>
                    {hasAnnotation && (
                      <span className="font-label text-[10px] text-on-primary/40 italic">
                        {chapter.annotations.filter(a => a.targetId === t.id).length} voices in chorus
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
