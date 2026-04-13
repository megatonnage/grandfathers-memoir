import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0E0C] text-[#F1F3F2] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Hero Image Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <Image
          src="/images/hero-family.jpg"
          alt="Family Gathering"
          fill
          className="object-cover object-center opacity-30 mix-blend-luminosity"
          priority
        />
        {/* Vignette Overlay (Dark fades from edges) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0E0C_80%)]" />
        {/* Grounding bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B0E0C] to-transparent" />
      </div>

      {/* Background ambient gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 mix-blend-color">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#1B4332] blur-[150px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#E59368] blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="font-label text-xs md:text-sm uppercase tracking-[0.4em] text-[#E59368] mb-8 block">
            A Living Archive
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-5xl md:text-8xl font-headline italic tracking-tight mb-8"
        >
          The Flow of<br/>
          <span className="text-[#85B084]">Silt & Stone</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="font-body text-lg md:text-xl text-[#939694] max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          A multi-generational record. Woven through the chorus of descendants, annotations, and distant voices echoing across time.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          onClick={onEnter}
          className="group relative flex items-center gap-4 px-10 py-5 bg-white/5 border border-white/[0.08] hover:bg-white/10 rounded-full overflow-hidden transition-all hover:border-[#85B084]/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#85B084]/0 via-[#85B084]/10 to-[#85B084]/0 -z-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="font-label text-sm uppercase tracking-[0.2em] font-bold text-[#F1F3F2] group-hover:text-[#85B084] transition-colors">
            Enter The Stream
          </span>
          <ArrowRight className="w-5 h-5 text-[#85B084] group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-label text-[10px] text-white/20 uppercase tracking-widest text-center"
      >
        Authorized Transmission <br/> 
        Record: 1954 — 2024
      </motion.div>
    </div>
  );
}
