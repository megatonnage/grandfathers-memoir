import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, MessageSquarePlus, Image as ImageIcon, Plus } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { GalleryImage, Annotation } from '../types';
import Image from 'next/image';

interface GalleryViewProps {
  images: GalleryImage[];
}

export default function GalleryView({ images }: GalleryViewProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newAnnotation, setNewAnnotation] = useState('');
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const fileRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Add to firestore
        const newImage: Omit<GalleryImage, 'id'> = {
          url: downloadURL,
          uploadedBy: 'Family Member',
          uploadedAt: new Date().toISOString(),
          annotations: []
        };
        
        await addDoc(collection(db, 'gallery'), newImage);
        setIsUploading(false);
      }
    );
  };

  const handleAddAnnotation = async () => {
    if (!newAnnotation.trim() || !selectedImage) return;

    const annotation: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      author: 'Family Member',
      content: newAnnotation,
      timestamp: new Date().toISOString(),
      era: 'present',
      status: 'pending',
      targetId: `img-${selectedImage.id}`
    };

    const updatedAnnotations = [...(selectedImage.annotations || []), annotation];

    try {
      const imageRef = doc(db, 'gallery', selectedImage.id);
      await updateDoc(imageRef, { annotations: updatedAnnotations });
      
      // Optimistic update of local state for snappiness
      setSelectedImage({ ...selectedImage, annotations: updatedAnnotations });
      setNewAnnotation('');
    } catch (error) {
      console.error("Error saving annotation", error);
    }
  };

  return (
    <div className="h-full bg-[#0B0E0C] text-[#F1F3F2] overflow-x-hidden overflow-y-auto pt-24 pb-40 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#E59368] block mb-2">
              VISUAL REPOSITORY
            </span>
            <h2 className="text-4xl md:text-5xl font-headline font-semibold text-[#F1F3F2] tracking-tight">
              Family Gallery
            </h2>
            <p className="font-body text-[#939694] mt-4 leading-relaxed max-w-xl">
              Artifacts and fragments logged by descendants. Add visual context to the ongoing stream.
            </p>
          </div>
          
          <label className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-[#E59368] text-[#0B0E0C] rounded-full font-label text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_24px_rgba(229,147,104,0.2)]">
             <Plus className="w-4 h-4" />
             {isUploading ? `UPLOADING ${Math.round(uploadProgress)}%` : 'UPLOAD ARTIFACT'}
             <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
          </label>
        </div>

        {/* Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map(image => (
            <motion.div 
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setSelectedImage(image)}
              className="relative break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer border border-white/[0.04] bg-[#171A18]"
            >
               <img src={image.url} alt="Gallery item" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0C] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
               
               <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-between items-end">
                  <div>
                    <span className="block font-label text-[9px] text-[#E59368] uppercase tracking-widest font-bold">
                       Logged by {image.uploadedBy}
                    </span>
                    <span className="block font-label text-[9px] text-[#939694] uppercase tracking-widest">
                       {new Date(image.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {(image.annotations?.length || 0) > 0 && (
                     <div className="flex items-center gap-1.5 text-[#85B084] font-label text-[10px]">
                        <MessageSquarePlus className="w-3 h-3" />
                        {image.annotations.length}
                     </div>
                  )}
               </div>
            </motion.div>
          ))}
          {images.length === 0 && !isUploading && (
            <div className="col-span-full py-20 text-center border border-white/[0.04] rounded-3xl bg-[#171A18]">
               <ImageIcon className="w-12 h-12 text-white/5 mx-auto mb-4" />
               <p className="font-body text-[#939694] italic">The gallery is currently empty.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0B0E0C]/90 backdrop-blur-xl flex justify-center items-center p-4 md:p-10"
          >
            <div className="absolute inset-0" onClick={() => setSelectedImage(null)} />
            
            <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white z-10 transition-colors">
               <X className="w-8 h-8" />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl max-h-full bg-[#131614] border border-white/[0.04] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10"
            >
               <div className="w-full md:w-3/5 bg-black flex items-center justify-center p-4">
                 <img src={selectedImage.url} alt="Gallery item" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
               </div>
               
               <div className="w-full md:w-2/5 flex flex-col h-[50vh] md:h-[80vh] bg-[#171A18]">
                 <div className="p-6 border-b border-white/[0.04]">
                   <span className="font-label text-[10px] text-[#E59368] uppercase tracking-widest font-bold">
                      Logged by {selectedImage.uploadedBy}
                   </span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {selectedImage.annotations?.length === 0 ? (
                       <div className="text-center py-10 opacity-50">
                          <MessageSquarePlus className="w-8 h-8 mx-auto mb-2 text-[#939694]" />
                          <p className="font-body text-sm text-[#939694] italic">No reflections on this artifact yet.</p>
                       </div>
                    ) : (
                      selectedImage.annotations?.map(ann => (
                        <div key={ann.id} className="bg-[#1A1F1B] border border-white/[0.04] p-4 rounded-2xl">
                           <div className="flex justify-between items-baseline mb-2">
                             <span className="font-label text-[10px] text-[#E59368] font-bold uppercase tracking-wider">{ann.author}</span>
                             <span className="font-label text-[9px] text-[#939694] uppercase tracking-tighter">
                               {new Date(ann.timestamp).toLocaleDateString()}
                             </span>
                           </div>
                           <p className="font-body text-[#F1F3F2] text-sm leading-relaxed">
                             "{ann.content}"
                           </p>
                        </div>
                      ))
                    )}
                 </div>

                 <div className="p-4 border-t border-white/[0.04] bg-[#131614]">
                    <div className="relative">
                      <textarea
                        value={newAnnotation}
                        onChange={(e) => setNewAnnotation(e.target.value)}
                        placeholder="Add your reflection..."
                        className="w-full bg-[#0B0E0C] border border-white/[0.04] rounded-xl p-3 pr-12 text-sm font-body text-[#F1F3F2] placeholder:text-[#939694]/50 focus:outline-none focus:border-[#85B084]/50 h-20 resize-none transition-colors"
                      />
                      <button 
                        onClick={handleAddAnnotation}
                        disabled={!newAnnotation.trim()}
                        className="absolute bottom-3 right-3 text-[#85B084] hover:text-[#F1F3F2] disabled:opacity-30 disabled:hover:text-[#85B084] transition-colors"
                      >
                         <Plus className="w-5 h-5" />
                      </button>
                    </div>
                 </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
