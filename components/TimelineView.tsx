import React from 'react';
import { History, Search, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function TimelineView() {
  const eras = [
    { year: 'Ancient Past', title: 'The Silent Sowing', desc: 'Ecological consciousness of the High Silt cultures.' },
    { year: '1954', title: 'The Great Migration', desc: 'A solitary young man builds a vision from the silt.' },
    { year: '2024', title: 'The Great Digitization', desc: 'Initial seeding of the Living Archive.' },
    { year: '2150', title: 'The Silent Century', desc: 'Data isolation and the emergence of AI Curators.' },
    { year: '2482', title: 'The Voice Synthesis', desc: 'Direct transmission between the Archive and the Collective.' },
  ];

  return (
    <div className="h-full bg-primary text-on-primary overflow-y-auto pt-24 pb-32 px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-4">
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-on-primary/60 block">
            Generational Drift Timeline
          </span>
          <h2 className="text-5xl font-headline italic leading-tight">
            Search across the <span className="text-on-tertiary-container">Silt & Stone</span>
          </h2>
          <div className="relative max-w-xl">
            <input 
              type="text" 
              placeholder="Search epochs, ancestors, or replicas..." 
              className="w-full bg-primary-container/30 border-b border-on-primary/20 py-4 pl-12 pr-4 font-body text-xl focus:outline-none focus:border-on-primary transition-colors"
            />
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-on-primary/40" />
          </div>
        </div>

        <div className="relative pl-8 space-y-12">
          <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-on-primary/20" />
          
          {eras.map((era, index) => (
            <motion.div 
              key={era.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute left-[-8px] top-2 w-4 h-[2px] bg-on-tertiary-container group-hover:w-6 transition-all" />
              <div className="bg-primary-container/10 p-6 -ml-4 border-l-2 border-transparent group-hover:border-on-tertiary-container transition-all">
                <span className="font-label text-[10px] text-on-tertiary-container block mb-1 font-bold">
                  {era.year}
                </span>
                <h4 className="font-headline text-2xl italic mb-2 group-hover:translate-x-2 transition-transform">
                  {era.title}
                </h4>
                <p className="text-sm text-on-primary/60 font-body max-w-md">
                  {era.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
