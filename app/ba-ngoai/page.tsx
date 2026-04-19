'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GalleryImage, Annotation } from '../../types';
import { MessageSquare, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BaNgoaiPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'ba-ngoai-gallery'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage)));
    });
    return () => unsubscribe();
  }, []);

  const handleAddAnnotation = async () => {
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
    <div className="min-h-screen bg-[#0B0E0C] text-[#F1F3F2]">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-[#0B0E0C] to-transparent">
        <Link href="/" className="flex items-center gap-2 text-[#F1F3F2]/80 hover:text-[#E59368] transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-label text-sm">Back to Home</span>
        </Link>
        <h1 className="font-headline text-2xl italic text-[#E59368]">Bà Ngoại</h1>
        <div className="w-20"></div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Heart className="w-8 h-8 text-[#E59368] mx-auto mb-6" />
          <h2 className="font-headline text-4xl md:text-6xl italic mb-4">
            In Memory of
          </h2>
          <p className="font-body text-lg text-[#939694] max-w-2xl mx-auto leading-relaxed">
            A gallery of memories, stories, and moments shared. 
            Click any image to view and share your own memories.
          </p>
        </motion.div>
      </section>

      {/* Image Grid */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-20 text-[#939694]">
            <p className="font-label">No images yet. Images will appear here once added.</p>
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
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-[#1a1f1c]"
              >
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0C]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-label text-sm text-[#F1F3F2] truncate">{image.caption}</p>
                    {image.annotations && image.annotations.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-[#E59368]">
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
          className="fixed inset-0 bg-[#0B0E0C]/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-[#F1F3F2]/60 hover:text-[#F1F3F2] transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#F1F3F2]/60 hover:text-[#F1F3F2] transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-[#F1F3F2]/60 hover:text-[#F1F3F2]"
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
            <div className="w-full md:w-80 bg-[#1a1f1c] rounded-lg p-4 flex flex-col max-h-[40vh] md:max-h-[70vh]">
              <h3 className="font-headline font-bold text-lg mb-2 text-[#E59368]">{selectedImage.caption}</h3>
              <p className="text-xs text-[#939694] font-label mb-4">
                Added {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </p>

              {/* Annotation List */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {selectedImage.annotations?.filter(a => a.status === 'approved').map((ann) => (
                  <div key={ann.id} className="bg-[#0B0E0C] p-3 rounded-lg">
                    <p className="text-sm text-[#F1F3F2]">{ann.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[#939694] font-label">{ann.author}</span>
                      <span className="text-[10px] text-[#E59368] font-label">
                        {new Date(ann.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {(!selectedImage.annotations || selectedImage.annotations.filter(a => a.status === 'approved').length === 0) && (
                  <p className="text-sm text-[#939694] italic text-center py-4">
                    No memories shared yet. Be the first to share a memory.
                  </p>
                )}
              </div>

              {/* Add Annotation */}
              <div className="border-t border-[#939694]/20 pt-3">
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Share a memory or thought about this photo..."
                  className="w-full p-3 text-sm bg-[#0B0E0C] border border-[#939694]/20 rounded-md resize-none h-24 text-[#F1F3F2] placeholder:text-[#939694]/50"
                />
                <button
                  onClick={handleAddAnnotation}
                  disabled={!annotationText.trim() || isSubmitting}
                  className="w-full mt-2 py-2 bg-[#E59368] text-[#0B0E0C] rounded-md text-sm font-label font-bold hover:bg-[#E59368]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Sharing...' : 'Share Memory'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
