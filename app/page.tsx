"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

export default function App() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary-container selection:text-on-secondary-container h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 text-[0]">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/ongba-19991.firebasestorage.app/o/gallery%2F1776620011033_First_Family_Pic.jpeg?alt=media&token=86753867-98b2-4f1b-a676-6b6fb0ef262e"
            alt="Multi-generational family portrait"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,transparent_15%,#0e1914_50%)]" style={{ opacity: 0.6 }}></div>
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
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
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
            
            <Link href="/ba-ngoai" passHref legacyBehavior>
              <motion.a 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="bg-[#E59368]/20 border border-[#E59368]/40 text-[#E59368] px-8 py-4 rounded-full text-[11px] tracking-[0.25em] uppercase hover:bg-[#E59368]/30 transition-all duration-500 flex items-center gap-3 group cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                BÀ NGOẠI
              </motion.a>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0e1914]/60 to-transparent z-10"></div>
      </section>
    </div>
  );
}
