import React, { useState } from 'react';
import { MessageSquare, Users, Send, Link as LinkIcon, Filter } from 'lucide-react';
import { Chapter, Annotation } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChorusSidebarProps {
  chapter: Chapter;
  isOpen: boolean;
  onClose: () => void;
  targetId?: string | null;
  onAddAnnotation: (content: string, targetId?: string | null) => void;
  onAddReply: (annotationId: string, content: string) => void;
  onLinkBack: (targetId: string) => void;
}

export default function ChorusSidebar({ chapter, isOpen, onClose, targetId, onAddAnnotation, onAddReply, onLinkBack }: ChorusSidebarProps) {
  const [newAnnotation, setNewAnnotation] = useState('');

  const handleSubmit = () => {
    if (!newAnnotation.trim()) return;
    onAddAnnotation(newAnnotation, targetId);
    setNewAnnotation('');
  };

  const filteredAnnotations = targetId 
    ? chapter.annotations.filter(a => a.targetId === targetId)
    : chapter.annotations;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Clickaway Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50]"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-96 bg-[#0B0E0C] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[60] flex flex-col border-l border-white/[0.04]"
          >
          <div className="h-16 bg-[#131614] flex items-center justify-between px-6 flex-shrink-0 border-b border-white/[0.04]">
            <div className="flex items-center gap-2 text-[#85B084]">
              <Users className="w-5 h-5" />
              <span className="font-label text-xs font-bold uppercase tracking-widest">
                {targetId ? `CHORUS: ${targetId}` : 'THE CHORUS'}
              </span>
            </div>
            <button onClick={onClose} className="text-[#939694] hover:text-[#F1F3F2] transition-colors">
              <span className="text-2xl">×</span>
            </button>
          </div>

          {targetId && (
            <div className="px-6 py-3 bg-[#171A18] border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] font-label uppercase tracking-widest text-[#E59368] font-bold">
                Filtering by paragraph
              </span>
              <button 
                onClick={() => onAddAnnotation('', null)} // Clear filter hack
                className="text-[10px] font-label uppercase tracking-widest text-[#939694] hover:text-[#F1F3F2]"
              >
                Show All
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {filteredAnnotations.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <MessageSquare className="w-12 h-12 text-[#939694]/20 mx-auto" />
                <p className="font-headline text-lg italic text-[#939694]">No voices here yet...</p>
              </div>
            ) : (
              filteredAnnotations.map((annotation) => (
                <AnnotationItem 
                  key={annotation.id} 
                  annotation={annotation} 
                  onReply={onAddReply}
                  onLinkBack={onLinkBack}
                />
              ))
            )}
          </div>

          <div className="p-6 border-t border-white/[0.04] bg-[#131614]">
            <div className="relative">
              <textarea
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                className="w-full bg-[#0B0E0C] border border-white/[0.04] rounded-xl p-4 pr-12 text-sm font-label text-[#F1F3F2] placeholder-[#939694]/50 focus:outline-none focus:border-[#85B084]/50 h-24 resize-none transition-colors"
                placeholder={targetId ? `Annotate ${targetId}...` : "Add your voice to the Chorus..."}
              />
              <button 
                onClick={handleSubmit}
                disabled={!newAnnotation.trim()}
                className="absolute bottom-4 right-4 text-[#85B084] hover:text-[#F1F3F2] hover:scale-110 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:hover:text-[#85B084]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function AnnotationItem({ annotation, onReply, onLinkBack, isReply = false }: { annotation: Annotation; onReply: (annotationId: string, content: string) => void; onLinkBack: (targetId: string) => void; isReply?: boolean }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply(annotation.id, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  const isDistantVoice = !annotation.targetId;

  return (
    <div className={cn("space-y-4", isReply && "ml-8 border-l border-white/[0.04] pl-6 py-2 relative")}>
      <div className="flex gap-4">
        <div className={cn(
          "rounded-full flex items-center justify-center font-bold flex-shrink-0",
          isReply ? "w-8 h-8 bg-[#171A18] text-[#85B084] text-[10px] border border-white/[0.04]" : "w-10 h-10 bg-[#2A1E18] text-[#E59368] text-xs border border-[#E59368]/30"
        )}>
          {annotation.author[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1 gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className={cn(
                "font-label font-bold uppercase tracking-wider truncate",
                isReply ? "text-[10px] text-[#85B084]" : "text-xs text-[#E59368]"
              )}>
                {annotation.author}
              </span>
              {annotation.targetId && (
                <button 
                  onClick={() => onLinkBack(annotation.targetId!)}
                  className="flex-shrink-0 text-[9px] bg-white/[0.04] px-1.5 rounded text-[#939694] font-mono hover:bg-[#85B084]/20 hover:text-[#85B084] transition-colors flex items-center gap-1 border border-white/[0.04]"
                >
                  <LinkIcon className="w-2 h-2" />
                  {annotation.targetId}
                </button>
              )}
            </div>
          </div>
          <p className={cn(
            "font-body leading-relaxed mb-2",
            isReply ? "text-xs text-[#939694] italic" : "text-sm text-[#F1F3F2]"
          )}>
            "{annotation.content}"
          </p>
          <div className="flex items-center gap-4">
             <span className={cn(
               "uppercase tracking-widest block font-label",
               isReply ? "text-[9px] text-white/20" : "text-[10px] text-white/30"
             )}>
               {new Date(annotation.timestamp).toLocaleDateString()}
             </span>
             {!isReply && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-[10px] font-label uppercase tracking-widest text-[#85B084] font-bold hover:text-[#F1F3F2] transition-colors"
                >
                  {isReplying ? 'Cancel' : 'Reply'}
                </button>
             )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className={cn("space-y-2", isReply ? "ml-12" : "ml-[56px]")}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full bg-[#131614] border border-white/[0.04] rounded-xl p-3 text-xs font-label text-[#F1F3F2] placeholder-[#939694]/50 focus:outline-none focus:border-[#85B084]/50 h-20 resize-none"
            placeholder={`Reply to ${annotation.author}...`}
            autoFocus
          />
          <div className="flex justify-end">
            <button 
              onClick={handleReplySubmit}
              disabled={!replyContent.trim()}
              className="bg-[#171A18] border border-white/[0.05] text-[#85B084] hover:bg-[#85B084] hover:text-[#0B0E0C] text-[10px] font-label uppercase tracking-widest px-4 py-2 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
            >
              Send Reply
            </button>
          </div>
        </div>
      )}
      
      {annotation.replies?.map((reply) => (
        <AnnotationItem 
          key={reply.id} 
          annotation={reply} 
          onReply={onReply}
          onLinkBack={onLinkBack}
          isReply={true}
        />
      ))}
    </div>
  );
}
