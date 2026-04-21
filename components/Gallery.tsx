'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { GalleryImage, Annotation } from '../types';
import { cn } from '../lib/utils';
import { Upload, X, MessageSquare, Trash2, ChevronLeft, ChevronRight, Copy, Check, Heart as HeartIcon } from 'lucide-react';
import LoginModal from './LoginModal';

interface GalleryProps {
  onImageClick?: (image: GalleryImage) => void;
  isAdmin?: boolean;
}

export default function Gallery({ onImageClick, isAdmin = false }: GalleryProps) {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [annotationText, setAnnotationText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
      setImages(loaded);
    });
    return () => unsubscribe();
  }, []);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const processUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload to Firebase Storage directly from client
      const fileRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
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
          // Upload complete, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save to Firestore
          await addDoc(collection(db, 'gallery'), {
            url: downloadURL,
            caption: newCaption || file.name,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Admin',
            annotations: []
          });
          
          setNewCaption('');
          setIsUploading(false);
          setUploadProgress(0);
          setPendingFile(null);
        }
      );
    } catch (err) {
      console.error(err);
      alert('Upload request failed: ' + (err as Error).message);
      setIsUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!isAuthenticated) {
      setPendingFile(file);
      setShowLoginModal(true);
      return;
    }
    
    await processUpload(file);
  };

  // Process pending file after login
  useEffect(() => {
    if (isAuthenticated && pendingFile) {
      processUpload(pendingFile);
    }
  }, [isAuthenticated, pendingFile]);

  const copyMarkdown = (image: GalleryImage) => {
    const markdown = `![${image.caption}](${image.url})`;
    navigator.clipboard.writeText(markdown);
    setCopiedId(image.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image permanently?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete image.');
    }
  };

  const handleAddAnnotation = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!selectedImage || !annotationText.trim()) return;

    const newAnnotation: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Family Member',
      content: annotationText,
      timestamp: new Date().toISOString(),
      era: 'present',
      status: 'pending'
    };

    const newAnnotations = [newAnnotation, ...(selectedImage.annotations || [])];

    try {
      await updateDoc(doc(db, 'gallery', selectedImage.id), {
        annotations: newAnnotations
      });
      setAnnotationText('');
    } catch (err) {
      console.error(err);
      alert('Failed to add annotation.');
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;
    setSelectedImage(images[newIndex]);
  };

  return (
    <div className="min-h-screen bg-surface p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-on-surface">Gallery</h1>
            <p className="text-outline font-label mt-1">
              {images.length} images • Click to view and annotate
            </p>
          </div>
          
          {/* Upload */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Caption (optional)"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="px-3 py-2 border border-outline-variant rounded-md text-sm font-label bg-surface"
            />
            <div className="flex flex-col items-end gap-2">
              {isUploading && (
                <div className="w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <label className={cn(
                "flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-md font-label cursor-pointer hover:bg-primary/90 transition-colors",
                isUploading && "opacity-50 cursor-not-allowed"
              )}>
                <Upload className="w-4 h-4" />
                {isUploading ? `${Math.round(uploadProgress)}%` : 'Upload Image'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div 
            key={image.id}
            className="group relative bg-white rounded-lg overflow-hidden shadow-sm border border-outline-variant cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onImageClick ? onImageClick(image) : setSelectedImage(image)}
          >
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={image.url} 
                alt={image.caption}
                className="w-full h-full object-cover grayscale-[0.2] sepia-[0.1] group-hover:grayscale-0 transition-all"
              />
              {/* Heart icon for images with annotations */}
              {image.annotations && image.annotations.length > 0 && (
                <div className="absolute top-2 right-2 p-1.5 bg-surface/80 backdrop-blur-sm rounded-full">
                  <HeartIcon className="w-4 h-4 text-primary fill-primary" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-label text-on-surface truncate">{image.caption}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-outline font-label">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  {image.annotations?.length || 0}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyMarkdown(image);
                    }}
                    className="p-1 text-outline hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy markdown"
                  >
                    {copiedId === image.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="p-1 text-outline hover:text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete image (admin only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="max-w-6xl mx-auto text-center py-20">
          <Upload className="w-12 h-12 text-outline/50 mx-auto mb-4" />
          <p className="text-outline font-label">No images yet. Upload your first image above.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.caption}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Annotations Panel */}
            <div className="w-full md:w-80 bg-surface rounded-lg p-4 flex flex-col max-h-[70vh]">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-headline font-bold text-lg">{selectedImage.caption}</h3>
                <button
                  onClick={() => copyMarkdown(selectedImage)}
                  className="p-2 text-outline hover:text-primary rounded-md hover:bg-surface-container transition-colors"
                  title="Copy markdown"
                >
                  {copiedId === selectedImage.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-outline font-label mb-4">
                Uploaded {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </p>

              {/* Annotation List */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {selectedImage.annotations?.map((ann) => (
                  <div key={ann.id} className="bg-surface-container-low p-3 rounded-lg">
                    <p className="text-sm text-on-surface">{ann.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-outline font-label">{ann.author}</span>
                      <span className={cn(
                        "text-[10px] uppercase font-label px-2 py-0.5 rounded",
                        ann.status === 'approved' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {ann.status}
                      </span>
                    </div>
                  </div>
                ))}
                {!selectedImage.annotations?.length && (
                  <p className="text-sm text-outline italic text-center py-4">
                    No annotations yet. Be the first to share a memory.
                  </p>
                )}
              </div>

              {/* Add Annotation */}
              <div className="border-t border-outline-variant pt-3">
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Share a memory or thought about this image..."
                  className="w-full p-2 text-sm border border-outline-variant rounded-md resize-none h-20 bg-surface-container-low"
                />
                <button
                  onClick={handleAddAnnotation}
                  disabled={!annotationText.trim()}
                  className="w-full mt-2 py-2 bg-primary text-on-primary rounded-md text-sm font-label hover:bg-primary/90 disabled:opacity-50"
                >
                  Add Annotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}
