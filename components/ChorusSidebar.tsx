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
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-96 bg-surface-container shadow-2xl z-[60] flex flex-col border-l border-outline-variant"
        >
          <div className="h-16 bg-primary-container text-on-primary flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-on-primary/80" />
              <span className="font-label text-xs font-bold uppercase tracking-widest">
                {targetId ? `Chorus: ${targetId}` : 'The Chorus'}
              </span>
            </div>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
              <span className="text-2xl">×</span>
            </button>
          </div>

          {targetId && (
            <div className="px-6 py-3 bg-primary/5 border-b border-outline-variant flex items-center justify-between">
              <span className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                Filtering by paragraph
              </span>
              <button 
                onClick={() => onAddAnnotation('', null)} // Clear filter hack
                className="text-[10px] font-label uppercase tracking-widest text-outline hover:text-primary"
              >
                Show All
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
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

          <div className="p-6 border-t border-outline-variant bg-surface">
            <div className="relative">
              <textarea
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 text-sm font-label focus:ring-1 focus:ring-primary h-24 resize-none"
                placeholder={targetId ? `Annotate ${targetId}...` : "Add your voice to the Chorus..."}
              />
              <button 
                onClick={handleSubmit}
                disabled={!newAnnotation.trim()}
                className="absolute bottom-4 right-4 text-primary hover:scale-110 transition-transform disabled:opacity-30 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.aside>
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

  return (
    <div className={cn("space-y-4", isReply && "ml-8 border-l-2 border-primary/10 pl-6 py-2")}>
      <div className="flex gap-4">
        <div className={cn(
          "rounded-sm flex items-center justify-center font-bold border",
          isReply ? "w-8 h-8 bg-surface-container-highest text-primary/60 text-[10px] border-outline-variant" : "w-10 h-10 bg-primary/10 text-primary text-xs border-primary/20"
        )}>
          {annotation.author[0]}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-label font-bold uppercase tracking-wider",
                isReply ? "text-[10px] text-primary/80" : "text-xs text-primary"
              )}>
                {annotation.author}
              </span>
              {annotation.targetId && (
                <button 
                  onClick={() => onLinkBack(annotation.targetId!)}
                  className="text-[9px] bg-primary/5 px-1 rounded text-primary/60 font-mono hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1"
                >
                  <LinkIcon className="w-2 h-2" />
                  {annotation.targetId}
                </button>
              )}
            </div>
            <span className={cn(
              "uppercase tracking-tighter",
              isReply ? "text-[9px] text-outline" : "text-[10px] text-outline"
            )}>
              {annotation.timestamp}
            </span>
          </div>
          <p className={cn(
            "font-body leading-relaxed",
            isReply ? "text-xs text-on-surface-variant italic" : "text-sm text-on-surface-variant"
          )}>
            {annotation.content}
          </p>
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="mt-2 text-[10px] font-label uppercase tracking-widest text-primary font-bold hover:opacity-70 transition-opacity"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        </div>
      </div>

      {isReplying && (
        <div className={cn("space-y-2", isReply ? "ml-12" : "ml-14")}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded p-3 text-xs font-label focus:ring-1 focus:ring-primary h-20 resize-none"
            placeholder={`Reply to ${annotation.author}...`}
            autoFocus
          />
          <div className="flex justify-end">
            <button 
              onClick={handleReplySubmit}
              disabled={!replyContent.trim()}
              className="bg-primary text-on-primary text-[10px] font-label uppercase tracking-widest px-4 py-2 rounded shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
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
