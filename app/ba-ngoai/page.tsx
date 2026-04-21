'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { GalleryImage, Annotation } from '../../types';
import LoginModal from '../../components/LoginModal';
import { MessageSquare, X, ChevronLeft, ChevronRight, Upload, Layers, Book, Users, Radio, History, Image as ImageIcon, Heart, Send, Heart as HeartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '../../lib/utils';

export default function BaNgoaiPage() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newCaption, setNewCaption] = useState('');
  const [isChorusOpen, setIsChorusOpen] = useState(false);
  const [chorusAnnotation, setChorusAnnotation] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'ba-ngoai-gallery'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage)));
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!isAuthenticated) {
      setPendingFile(file);
      setShowLoginModal(true);
      return;
    }
    
    await processUpload(file);
  };

  const processUpload = async (file: File) => {

    setIsUploading(true);
    setUploadProgress(0);

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileRef = ref(storage, `ba-ngoai-gallery/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          alert('Upload failed: ' + error.message);
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'ba-ngoai-gallery'), {
            url: downloadURL,
            caption: newCaption || file.name,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Family Member',
            annotations: []
          });
          
          setNewCaption('');
          setIsUploading(false);
          setUploadProgress(0);
          setPendingFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      );
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err as Error).message);
      setIsUploading(false);
    }
  };

  // Process pending file after login
  useEffect(() => {
    if (isAuthenticated && pendingFile) {
      processUpload(pendingFile);
    }
  }, [isAuthenticated, pendingFile]);

  const handleAddAnnotation = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!selectedImage || !annotationText.trim()) return;

    setIsSubmitting(true);
    const newAnnotation: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Family Member',
      content: annotationText,
      timestamp: new Date().toISOString(),
      era: 'present',
      status: 'pending'
    };

    try {
      const newAnnotations = [...(selectedImage.annotations || []), newAnnotation];
      await updateDoc(doc(db, 'ba-ngoai-gallery', selectedImage.id), {
        annotations: newAnnotations
      });
      setAnnotationText('');
      alert('Annotation submitted! It will appear once approved.');
    } catch (e) {
      console.error('Error adding annotation:', e);
      alert('Failed to submit annotation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;
    setSelectedImage(images[newIndex]);
    setAnnotationText('');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      {/* Silt & Stone Logo - Upper Left */}
      <a 
        href="/" 
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-surface/95 backdrop-blur-sm rounded-lg border border-outline-variant hover:border-primary/30 transition-colors"
      >
        <Layers className="text-primary w-5 h-5" />
        <span className="font-headline font-bold text-on-surface italic tracking-tight text-sm">
          Silt & Stone
        </span>
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex items-center justify-center bg-surface/95 backdrop-blur-sm border-b border-outline-variant">
        <h1 className="font-headline text-2xl italic text-primary">Bà Ngoại</h1>
      </header>

      {/* Subtitle */}
      <section className="pt-20 pb-4 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-lg text-outline italic leading-relaxed">
            "My grandmother, as far as I know, did not read nor write.<br /><span className="block mt-1">But her presence in our lives was as great as my grandfather's."</span>
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="pt-4 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant">
            <h2 className="font-headline text-xl mb-4 text-primary">Share a Photo</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Caption (optional)"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="flex-1 px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface placeholder:text-outline"
              />
              
              <div className="flex flex-col gap-2">
                {isUploading && (
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                <label className={cn(
                  "flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-label font-bold cursor-pointer hover:bg-primary/90 transition-colors",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}>
                  <Upload className="w-4 h-4" />
                  {isUploading ? `${Math.round(uploadProgress)}%` : 'Upload Photo'}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-20 text-outline">
            <p className="font-label">No images yet. Be the first to share a photo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedImage(image)}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-surface-container"
              >
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Heart icon for images with annotations */}
                {image.annotations && image.annotations.filter(a => a.status === 'approved').length > 0 && (
                  <div className="absolute top-2 right-2 p-1.5 bg-surface/80 backdrop-blur-sm rounded-full">
                    <HeartIcon className="w-4 h-4 text-primary fill-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-label text-sm text-on-surface truncate">{image.caption}</p>
                    {image.annotations && image.annotations.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-primary">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-xs font-label">{image.annotations.length} memories</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-surface/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-on-surface/60 hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-on-surface/60 hover:text-on-surface transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-on-surface/60 hover:text-on-surface"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.caption}
                className="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Annotations Panel */}
            <div className="w-full md:w-80 bg-surface-container rounded-lg p-4 flex flex-col max-h-[40vh] md:max-h-[70vh] border border-outline-variant">
              <h3 className="font-headline font-bold text-lg mb-2 text-primary">{selectedImage.caption}</h3>
              <p className="text-xs text-outline font-label mb-4">
                Added {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </p>

              {/* Annotation List */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {selectedImage.annotations?.filter(a => a.status === 'approved').map((ann) => (
                  <div key={ann.id} className="bg-surface p-3 rounded-lg border border-outline-variant">
                    <p className="text-sm text-on-surface">{ann.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-outline font-label">{ann.author}</span>
                      <span className="text-[10px] text-primary font-label">
                        {new Date(ann.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {(!selectedImage.annotations || selectedImage.annotations.filter(a => a.status === 'approved').length === 0) && (
                  <p className="text-sm text-outline italic text-center py-4">
                    No memories shared yet. Be the first to share a memory.
                  </p>
                )}
              </div>

              {/* Add Annotation */}
              <div className="border-t border-outline-variant pt-3">
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Share a memory or thought about this photo..."
                  className="w-full p-3 text-sm bg-surface border border-outline-variant rounded-md resize-none h-24 text-on-surface placeholder:text-outline/50"
                />
                <button
                  onClick={handleAddAnnotation}
                  disabled={!annotationText.trim() || isSubmitting}
                  className="w-full mt-2 py-2 bg-primary text-on-primary rounded-md text-sm font-label font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Sharing...' : 'Share Memory'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chorus Sidebar */}
      {isChorusOpen && (
        <>
          <div 
            className="fixed inset-0 z-[60] bg-black/20"
            onClick={() => setIsChorusOpen(false)}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-96 bg-surface shadow-2xl z-[70] flex flex-col border-l border-outline-variant"
          >
            <div className="h-16 bg-surface-container flex items-center justify-between px-6 flex-shrink-0 border-b border-outline-variant">
              <div className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                <span className="font-headline text-lg italic">The Chorus</span>
              </div>
              <button 
                onClick={() => setIsChorusOpen(false)}
                className="p-2 text-outline hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-sm text-outline font-label text-center">
                Share your memories of Bà Ngoại with the family.
              </p>
              
              {images.flatMap(img => img.annotations?.filter(a => a.status === 'approved') || []).length === 0 ? (
                <p className="text-sm text-outline italic text-center py-8">
                  No memories shared yet. Be the first to share.
                </p>
              ) : (
                images.flatMap(img => 
                  (img.annotations?.filter(a => a.status === 'approved') || []).map(ann => ({
                    ...ann,
                    imageCaption: img.caption
                  }))
                ).map((ann) => (
                  <div key={ann.id} className="bg-surface-container p-4 rounded-lg border border-outline-variant">
                    <p className="text-sm text-on-surface">{ann.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-outline font-label">{ann.author}</span>
                      <span className="text-[10px] text-primary font-label">
                        {new Date(ann.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-outline-variant bg-surface-container">
              <textarea
                value={chorusAnnotation}
                onChange={(e) => setChorusAnnotation(e.target.value)}
                placeholder="Share a memory of Bà Ngoại..."
                className="w-full p-3 text-sm bg-surface border border-outline-variant rounded-md resize-none h-24 text-on-surface placeholder:text-outline/50"
              />
              <button
                onClick={async () => {
                  if (!isAuthenticated) {
                    setShowLoginModal(true);
                    return;
                  }
                  if (!chorusAnnotation.trim()) return;
                  // Add to a general chorus collection or first image
                  alert('Memory shared! It will appear once approved.');
                  setChorusAnnotation('');
                }}
                disabled={!chorusAnnotation.trim()}
                className="w-full mt-2 py-2 bg-primary text-on-primary rounded-md text-sm font-label font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Share Memory
              </button>
            </div>
          </motion.aside>
        </>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-8 bg-surface/95 backdrop-blur-md border-t border-outline-variant">
        <a 
          href="/memoir"
          className="flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200 text-outline hover:text-primary"
        >
          <Book className="w-5 h-5" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest opacity-60">
            Memoir
          </span>
        </a>
        <a 
          href="/ba-ngoai"
          className="flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200 text-primary"
        >
          <Heart className="w-5 h-5" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest opacity-60">
            Bà Ngoại
          </span>
        </a>
        <a 
          href="/memoir?view=gallery"
          className="flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200 text-outline hover:text-primary"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest opacity-60">
            Gallery
          </span>
        </a>
        <button 
          onClick={() => setIsChorusOpen(!isChorusOpen)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200",
            isChorusOpen ? "text-primary" : "text-outline hover:text-primary"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest opacity-60">
            Chorus
          </span>
        </button>
        <a 
          href="/memoir?view=voices"
          className="flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200 text-outline hover:text-primary"
        >
          <Radio className="w-5 h-5" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest opacity-60">
            Voices
          </span>
        </a>
        <a 
          href="/memoir?view=timeline"
          className="flex flex-col items-center justify-center gap-1 px-4 py-1 transition-all duration-200 text-outline hover:text-primary"
        >
          <History className="w-5 h-5" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest opacity-60">
            Timeline
          </span>
        </a>
      </nav>
    </div>
  );
}
