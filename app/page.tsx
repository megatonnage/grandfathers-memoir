"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function App() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 text-[0]">
          <img
            src="https://lh3.googleusercontent.com/aida/ADBb0uhdRs1gvvAAtG5H8M8yaKbCOa8gB4NFzLbDFaXr3JUc-Mpd_VdpYk1arl_nfrq3RGGnr-TiBqLDSW36PNKtTKQrzfRKWwZy4v7rcPs_4IH2lGuGgNhzOuyZO_Rb-JyIxs9JPFQ5g_vZplDhQvrq22B7WpIFRAWSUoNQ31UGUGN_rjCTHexvJvqenIlj37RT031hNk-1TL1YVMZRkzW0c4qzSxmWzy7OqZxkXe3czxi2Pr9mRj-eSf1wH88vq-1Z6MueXp7ZkWkyeQ"
            alt="Multi-generational family portrait"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 spotlight-overlay"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-headline text-center flex flex-col items-center tracking-tight mb-12"
          >
            <span className="italic font-bold text-[#b35d48] block text-7xl md:text-9xl leading-[0.85] tracking-tighter">
              Silt <span className="text-[0.85em]">&</span> Stone
            </span>
          </motion.h1>
          
          <Link href="/memoir" passHref legacyBehavior>
            <motion.a 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-full text-[11px] tracking-[0.25em] uppercase hover:bg-white/10 transition-all duration-500 flex items-center gap-4 group cursor-pointer"
            >
              READ THE MEMOIR 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </Link>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0e1914]/60 to-transparent z-10"></div>
      </section>
    </div>
  );
}
