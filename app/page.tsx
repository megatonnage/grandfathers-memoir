'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import BilingualReader from '../components/BilingualReader';
import ChorusSidebar from '../components/ChorusSidebar';
import TimelineView from '../components/TimelineView';
import DistantVoices from '../components/DistantVoices';
import { Book, Users, Radio, History, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Chapter, Annotation } from '../types';

type View = 'memoir' | 'chorus' | 'voices' | 'timeline';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('memoir');
  const [isChorusOpen, setIsChorusOpen] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'chapters'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChapters = snapshot.docs.map(doc => doc.data() as Chapter);
      setChapters(loadedChapters);
    });
    return () => unsubscribe();
  }, []);

  const currentChapter = chapters[currentChapterIndex];

  const handleAnnotate = (targetId?: string | null) => {
    setActiveTargetId(targetId || null);
    setIsChorusOpen(true);
  };

  const handleAddAnnotation = async (content: string, targetId?: string | null) => {
    if (!content) {
      // Hack to clear filter from sidebar
      setActiveTargetId(null);
      return;
    }

    const newAnnotation: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Family Member',
      content,
      timestamp: new Date().toISOString(),
      era: 'present',
      status: 'pending',
      targetId: targetId || undefined
    };

    if (!currentChapter) return;
    
    // Optimistic fallback for slow connections
    const newAnnotations = [newAnnotation, ...(currentChapter.annotations || [])];
    
    try {
      const chapterRef = doc(db, 'chapters', currentChapter.id);
      await updateDoc(chapterRef, { annotations: newAnnotations });
      alert("Annotation submitted! It will appear once approved by the family historian.");
    } catch (e) {
      console.error("Error saving annotation:", e);
      alert("Failed to submit annotation.");
    }
  };

  const handleAddReply = async (annotationId: string, content: string) => {
    const newReply: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Family Member',
      content,
      timestamp: new Date().toISOString(),
      era: 'present',
      status: 'pending'
    };

    const addReplyToTree = (annotations: Annotation[]): Annotation[] => {
      return annotations.map(ann => {
        if (ann.id === annotationId) {
          return {
            ...ann,
            replies: [...(ann.replies || []), newReply]
          };
        }
        if (ann.replies && ann.replies.length > 0) {
          return {
            ...ann,
            replies: addReplyToTree(ann.replies)
          };
        }
        return ann;
      });
    };

    if (!currentChapter) return;
    const newAnnotations = addReplyToTree(currentChapter.annotations || []);
    
    try {
      const chapterRef = doc(db, 'chapters', currentChapter.id);
      await updateDoc(chapterRef, { annotations: newAnnotations });
      alert("Reply submitted! It will appear once approved by the family historian.");
    } catch (e) {
      console.error("Error saving reply:", e);
      alert("Failed to submit reply.");
    }
  };

  const handleLinkBack = (targetId: string) => {
    if (targetId.startsWith('p') || targetId.startsWith('en-p')) {
      setCurrentView('memoir');
    } else if (targetId.startsWith('t')) {
      setCurrentView('voices');
    }
    setActiveTargetId(targetId);
    
    // Smooth scroll to the element after a short delay to allow view switch
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {!currentChapter ? (
          <div className="w-full h-full flex flex-col items-center justify-center pt-32 text-on-surface-variant animate-pulse">
            <p className="font-title text-xl">Dusting off the archive...</p>
          </div>
        ) : (
          <>
            {currentView === 'memoir' && (
          <BilingualReader 
            chapter={currentChapter} 
            onAnnotate={handleAnnotate}
            activeAnnotationId={activeTargetId || undefined}
          />
        )}
        {currentView === 'voices' && (
          <DistantVoices 
            chapters={chapters}
            onAnnotate={handleAnnotate}
            activeAnnotationId={activeTargetId || undefined}
          />
        )}
        {currentView === 'timeline' && (
          <TimelineView chapters={chapters} onNavigateToChapter={(idx, evType, targetId) => {
            setCurrentChapterIndex(idx);
            if (evType === 'voice') {
              setCurrentView('voices');
            } else if (evType === 'annotation' && targetId) {
              setCurrentView('memoir');
              setActiveTargetId(targetId);
              setIsChorusOpen(true);
              setTimeout(() => {
                const element = document.getElementById(targetId);
                if (element) {
                   element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 150);
            } else {
              setCurrentView('memoir');
            }
          }} />
        )}
        
        {/* Floating Action Button for Annotations */}
        {currentView === 'memoir' && (
          <button 
            onClick={() => {
              setActiveTargetId(null);
              setIsChorusOpen(true);
            }}
            className="fixed bottom-24 right-8 w-14 h-14 bg-tertiary text-on-primary rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <Edit3 className="w-6 h-6" />
          </button>
        )}

        <ChorusSidebar 
          chapter={currentChapter} 
          isOpen={isChorusOpen} 
          onClose={() => {
            setIsChorusOpen(false);
            setActiveTargetId(null);
          }}
          targetId={activeTargetId}
          onAddAnnotation={handleAddAnnotation}
          onAddReply={handleAddReply}
          onLinkBack={handleLinkBack}
        />
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-8 bg-surface/95 backdrop-blur-md border-t border-outline-variant">
        <NavButton 
          active={currentView === 'memoir'} 
          onClick={() => setCurrentView('memoir')}
          icon={<Book className="w-5 h-5" />}
          label="Memoir"
        />
        <NavButton 
          active={currentView === 'chorus'} 
          onClick={() => {
            setCurrentView('memoir');
            setActiveTargetId(null);
            setIsChorusOpen(true);
          }}
          icon={<Users className="w-5 h-5" />}
          label="Chorus"
        />
        <NavButton 
          active={currentView === 'voices'} 
          onClick={() => setCurrentView('voices')}
          icon={<Radio className="w-5 h-5" />}
          label="Voices"
        />
        <NavButton 
          active={currentView === 'timeline'} 
          onClick={() => setCurrentView('timeline')}
          icon={<History className="w-5 h-5" />}
          label="Timeline"
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200 cursor-pointer",
        active ? "text-primary scale-110" : "text-outline hover:text-primary/60"
      )}
    >
      {icon}
      <span className={cn(
        "font-label text-[10px] font-bold uppercase tracking-widest",
        active ? "opacity-100" : "opacity-60"
      )}>
        {label}
      </span>
    </button>
  );
}
