import React, { useState } from 'react';
import { MessageSquare, Users, Send, Link as LinkIcon, Heart } from 'lucide-react';
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
            className="fixed inset-0 z-[50] bg-black/20"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-96 bg-surface shadow-2xl z-[60] flex flex-col border-l border-outline-variant"
          >
          <div className="h-16 bg-surface-container flex items-center justify-between px-6 flex-shrink-0 border-b border-outline-variant">
            <div className="flex items-center gap-2 text-primary">
              <Users className="w-5 h-5" />
              <span className="font-label text-xs font-bold uppercase tracking-widest">
                {targetId ? `Chorus: ${targetId}` : 'The Chorus'}
              </span>
            </div>
            <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
              <span className="text-2xl">×</span>
            </button>
          </div>

          {targetId && (
            <div className="px-6 py-3 bg-surface-container-high border-b border-outline-variant flex items-center justify-between">
              <span className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">
                Filtering by paragraph
              </span>
              <button 
                onClick={() => onAddAnnotation('', null)} // Clear filter hack
                className="text-[10px] font-label uppercase tracking-widest text-outline hover:text-on-surface"
              >
                Show All
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {filteredAnnotations.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <MessageSquare className="w-12 h-12 text-outline/20 mx-auto" />
                <p className="font-headline text-lg italic text-outline">No voices here yet...</p>
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

          <div className="p-6 border-t border-outline-variant bg-surface-container">
            <div className="relative">
              <textarea
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl p-4 pr-12 text-sm font-label text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary/50 h-24 resize-none transition-colors"
                placeholder={targetId ? `Annotate ${targetId}...` : "Add your voice to the Chorus..."}
              />
              <button 
                onClick={handleSubmit}
                disabled={!newAnnotation.trim()}
                className="absolute bottom-4 right-4 text-primary hover:text-on-surface hover:scale-110 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:hover:text-primary"
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
    <div className={cn("space-y-4", isReply && "ml-8 border-l border-outline-variant pl-6 py-2 relative")}>
      <div className="flex gap-4">
        <div className={cn(
          "rounded-full flex items-center justify-center font-bold flex-shrink-0",
          isReply ? "w-8 h-8 bg-surface-container text-primary text-[10px] border border-outline-variant" : "w-10 h-10 bg-secondary-container text-secondary text-xs border border-secondary/30"
        )}>
          {annotation.author[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1 gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className={cn(
                "font-label font-bold uppercase tracking-wider truncate",
                isReply ? "text-[10px] text-primary" : "text-xs text-secondary"
              )}>
                {annotation.author}
              </span>
              {annotation.targetId && (
                <button 
                  onClick={() => onLinkBack(annotation.targetId!)}
                  className="flex-shrink-0 text-[9px] bg-surface-container px-1.5 rounded text-outline font-mono hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-1 border border-outline-variant"
                >
                  <LinkIcon className="w-2 h-2" />
                  {annotation.targetId}
                </button>
              )}
            </div>
          </div>
          <p className={cn(
            "font-body leading-relaxed mb-2",
            isReply ? "text-xs text-outline italic" : "text-sm text-on-surface"
          )}>
            "{annotation.content}"
          </p>
          <div className="flex items-center gap-4">
             <span className={cn(
               "uppercase tracking-widest block font-label",
               isReply ? "text-[9px] text-outline/50" : "text-[10px] text-outline/60"
             )}>
               {new Date(annotation.timestamp).toLocaleDateString()}
             </span>
             {!isReply && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-[10px] font-label uppercase tracking-widest text-primary font-bold hover:text-on-surface transition-colors"
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
            className="w-full bg-surface-container border border-outline-variant rounded-xl p-3 text-xs font-label text-on-surface placeholder-outline/50 focus:outline-none focus:border-primary/50 h-20 resize-none"
            placeholder={`Reply to ${annotation.author}...`}
            autoFocus
          />
          <div className="flex justify-end">
            <button 
              onClick={handleReplySubmit}
              disabled={!replyContent.trim()}
              className="bg-surface-container border border-outline-variant text-primary hover:bg-primary hover:text-on-primary text-[10px] font-label uppercase tracking-widest px-4 py-2 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
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
