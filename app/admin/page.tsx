'use client';

import React, { useState, useEffect } from 'react';
import { useState as useStateLocal } from 'react';
import { Upload, MessageSquare, Settings, FileText, Image as ImageIcon, Users, BookOpen, Check, X, Heart, Trash2, Radio, History, Layers, Edit3, LogOut, User, Mail } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Chapter, Annotation, GalleryImage } from '../../types';
import { cn } from '../../lib/utils';
import BilingualEditor from '../../components/BilingualEditor';
import Gallery from '../../components/Gallery';
import AnnotationManager from '../../components/AnnotationManager';
import LoginModal from '../../components/LoginModal';
import InviteManager from '../../components/InviteManager';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminDashboard() {
  const { currentUser, userProfile, isAuthenticated, isAdmin, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'gallery' | 'moderation' | 'annotations' | 'ba-ngoai' | 'experiences' | 'invites' | 'settings'>('chapters');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [baNgoaiImages, setBaNgoaiImages] = useState<GalleryImage[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Show login modal if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !showLoginModal) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated, showLoginModal]);

  useEffect(() => {
    const q = query(collection(db, 'chapters'), orderBy('order', 'asc'));
    const unsubscribeChapters = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Chapter));
      setChapters(loaded);
      // Keep selected chapter in sync
      if (selectedChapter) {
        const updated = loaded.find(c => c.id === selectedChapter.id);
        if (updated) setSelectedChapter(updated);
      }
    });

    const uq = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(uq, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const gq = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
    const unsubscribeGallery = onSnapshot(gq, (snapshot) => {
      setGalleryImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage)));
    });

    const bnq = query(collection(db, 'ba-ngoai-gallery'), orderBy('uploadedAt', 'desc'));
    const unsubscribeBaNgoai = onSnapshot(bnq, (snapshot) => {
      setBaNgoaiImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage)));
    });

    return () => {
      unsubscribeChapters();
      unsubscribeUsers();
      unsubscribeGallery();
      unsubscribeBaNgoai();
    };
  }, [selectedChapter?.id]);

  const handleSaveChapter = async (chapterId: string, updates: { contentVi?: string; contentEn?: string; title?: string; year?: string; order?: number }) => {
    try {
      await updateDoc(doc(db, 'chapters', chapterId), updates);
    } catch (e) {
      console.error('Failed to save chapter:', e);
      throw e;
    }
  };

  const handleAddChapter = async (insertIndex: number) => {
    const newOrder = insertIndex + 0.5; // Temporary order for insertion
    const newChapter: Omit<Chapter, 'id'> = {
      title: 'New Chapter',
      year: '',
      contentVi: '',
      contentEn: '',
      annotations: [],
      order: newOrder
    };

    try {
      await addDoc(collection(db, 'chapters'), newChapter);
      // Reorder chapters to fix the .5 order
      const sortedChapters = [...chapters];
      sortedChapters.splice(insertIndex, 0, { ...newChapter, id: 'temp' } as Chapter);
      
      // Update all chapter orders
      for (let i = 0; i < sortedChapters.length; i++) {
        if (sortedChapters[i].id !== 'temp') {
          await updateDoc(doc(db, 'chapters', sortedChapters[i].id), { order: i });
        }
      }
    } catch (e) {
      console.error('Failed to add chapter:', e);
      alert('Failed to add chapter.');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    
    try {
      await deleteDoc(doc(db, 'chapters', chapterId));
      // Reorder remaining chapters
      const remainingChapters = chapters.filter(c => c.id !== chapterId);
      for (let i = 0; i < remainingChapters.length; i++) {
        await updateDoc(doc(db, 'chapters', remainingChapters[i].id), { order: i });
      }
    } catch (e) {
      console.error('Failed to delete chapter:', e);
      alert('Failed to delete chapter.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isTranslation: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await fetch('/api/admin/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, isTranslation })
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Get all pending annotations with their context (from chapters and gallery)
  const getPendingAnnotations = () => {
    const pending: Array<{
      annotation: Annotation;
      chapterId: string;
      chapterTitle: string;
      parentId?: string;
      isGallery?: boolean;
      galleryImageId?: string;
      galleryImageCaption?: string;
    }> = [];
    
    // Chapter annotations
    chapters.forEach(ch => {
      const findPending = (anns: Annotation[], parentId?: string) => {
        anns.forEach(a => {
          if (a.status === 'pending') {
            pending.push({
              annotation: a,
              chapterId: ch.id,
              chapterTitle: ch.title,
              parentId
            });
          }
          if (a.replies) {
            findPending(a.replies, a.id);
          }
        });
      };
      if (ch.annotations) findPending(ch.annotations);
    });
    
    // Gallery image annotations
    galleryImages.forEach(img => {
      if (img.annotations) {
        img.annotations.forEach(a => {
          if (a.status === 'pending') {
            pending.push({
              annotation: a,
              chapterId: 'gallery',
              chapterTitle: 'Gallery',
              isGallery: true,
              galleryImageId: img.id,
              galleryImageCaption: img.caption
            });
          }
        });
      }
    });
    
    return pending;
  };

  const pendingAnnotations = getPendingAnnotations();
  const pendingCount = pendingAnnotations.length;

  const handleModerate = async (
    chapterId: string, 
    annotationId: string, 
    action: 'approve' | 'reject', 
    parentId?: string,
    isGallery?: boolean,
    galleryImageId?: string
  ) => {
    // Handle gallery image annotations
    if (isGallery && galleryImageId) {
      const image = galleryImages.find(img => img.id === galleryImageId);
      if (!image) return;

      const newAnnotations = image.annotations?.filter(a => !(action === 'reject' && a.id === annotationId))
        .map(a => {
          if (a.id === annotationId && action === 'approve') {
            return { ...a, status: 'approved' as const };
          }
          return a;
        }) || [];

      try {
        await updateDoc(doc(db, 'gallery', galleryImageId), { annotations: newAnnotations });
      } catch (e) {
        console.error(e);
        alert('Failed to update moderation status.');
      }
      return;
    }

    // Handle chapter annotations
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const processTree = (annotations: Annotation[]): Annotation[] => {
      return annotations.filter(a => !(action === 'reject' && a.id === annotationId)).map(a => {
        if (a.id === annotationId && action === 'approve') {
          return { ...a, status: 'approved' as const };
        }
        if (a.replies) {
          return { ...a, replies: processTree(a.replies) };
        }
        return a;
      });
    };

    // If it's a reply, find the parent and update its replies
    if (parentId) {
      const updateReplies = (annotations: Annotation[]): Annotation[] => {
        return annotations.map(a => {
          if (a.id === parentId && a.replies) {
            return {
              ...a,
              replies: processTree(a.replies)
            };
          }
          if (a.replies) {
            return { ...a, replies: updateReplies(a.replies) };
          }
          return a;
        });
      };
      
      const newAnnotations = updateReplies(chapter.annotations || []);
      try {
        await updateDoc(doc(db, 'chapters', chapterId), { annotations: newAnnotations });
      } catch (e) {
        console.error(e);
        alert('Failed to update moderation status.');
      }
    } else {
      // Top-level annotation
      const newAnnotations = processTree(chapter.annotations || []);
      try {
        await updateDoc(doc(db, 'chapters', chapterId), { annotations: newAnnotations });
      } catch (e) {
        console.error(e);
        alert('Failed to update moderation status.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-primary italic">Control Panel</h1>
          <p className="text-sm text-outline mt-1 font-label">The Living Archive</p>
        </div>

        <div className="flex flex-col gap-2">
          <TabButton 
            active={activeTab === 'chapters'} 
            onClick={() => { setActiveTab('chapters'); setSelectedChapter(null); }}
            icon={<BookOpen className="w-5 h-5" />}
            label="Chapters"
          />
          <TabButton 
            active={activeTab === 'gallery'} 
            onClick={() => { setActiveTab('gallery'); setSelectedChapter(null); }}
            icon={<ImageIcon className="w-5 h-5" />}
            label="Gallery"
          />
          <TabButton 
            active={activeTab === 'moderation'} 
            onClick={() => { setActiveTab('moderation'); setSelectedChapter(null); }}
            icon={<MessageSquare className="w-5 h-5" />}
            label="Moderation"
            badge={pendingCount > 0 ? pendingCount : undefined}
          />
          <TabButton 
            active={activeTab === 'annotations'} 
            onClick={() => { setActiveTab('annotations'); setSelectedChapter(null); }}
            icon={<BookOpen className="w-5 h-5" />}
            label="All Annotations"
          />
          <TabButton 
            active={activeTab === 'ba-ngoai'} 
            onClick={() => { setActiveTab('ba-ngoai'); setSelectedChapter(null); }}
            icon={<Heart className="w-5 h-5" />}
            label="Bà Ngoại"
          />
          <TabButton 
            active={activeTab === 'experiences'} 
            onClick={() => { setActiveTab('experiences'); setSelectedChapter(null); }}
            icon={<Layers className="w-5 h-5" />}
            label="Experiences"
          />
          {isAdmin && (
            <TabButton 
              active={activeTab === 'invites'} 
              onClick={() => { setActiveTab('invites'); setSelectedChapter(null); }}
              icon={<Mail className="w-5 h-5" />}
              label="Invites"
            />
          )}
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setSelectedChapter(null); }}
            icon={<Settings className="w-5 h-5" />}
            label="Family Settings"
          />
        </div>

        {/* User Info */}
        {isAuthenticated && userProfile && (
          <div className="mt-auto pt-6 border-t border-outline-variant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label font-medium text-on-surface truncate">{userProfile.displayName}</p>
                <p className="text-xs text-outline truncate">{userProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-label uppercase",
                userProfile.role === 'admin' ? "bg-red-100 text-red-700" :
                userProfile.role === 'moderator' ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-700"
              )}>
                {userProfile.role}
              </span>
              <button
                onClick={logout}
                className="p-2 text-outline hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'chapters' && (
          <div className="h-full flex">
            {/* Chapter List */}
            {!selectedChapter && (
              <div className="w-full p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-headline text-on-surface">Chapters</h2>
                    
                    {/* Upload */}
                    <div className="flex items-center gap-3">
                      <label className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-md font-label cursor-pointer hover:bg-primary/90 transition-colors",
                        isUploading && "opacity-50 cursor-not-allowed"
                      )}>
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : 'Upload Markdown'}
                        <input 
                          type="file" 
                          accept=".md,.txt" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, false)}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Add Chapter at Beginning */}
                    <button
                      onClick={() => handleAddChapter(0)}
                      className="w-full py-3 border-2 border-dashed border-outline-variant rounded-xl text-outline font-label hover:border-primary hover:text-primary transition-colors"
                    >
                      + Add Chapter Here
                    </button>

                    {chapters.map((chapter, index) => (
                      <div key={chapter.id} className="group">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-1 p-4 bg-white rounded-xl border border-outline-variant hover:border-primary/30 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <EditableTitle 
                                  title={chapter.title} 
                                  onSave={(newTitle) => handleSaveChapter(chapter.id, { title: newTitle })}
                                />
                                <p className="text-sm text-outline font-label mt-1">{chapter.year || 'No year set'}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-outline font-label">
                                  {chapter.contentVi.split('\n\n').filter(p => p.trim()).length} paragraphs
                                </span>
                                {chapter.annotations?.length > 0 && (
                                  <span className="block text-xs text-primary font-label mt-1">
                                    {chapter.annotations.length} annotations
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedChapter(chapter)}
                              className="mt-3 text-sm font-label text-primary hover:underline"
                            >
                              Edit chapter →
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="p-3 text-outline hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete chapter"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Add Chapter After */}
                        <button
                          onClick={() => handleAddChapter(index + 1)}
                          className="w-full py-2 border-2 border-dashed border-outline-variant/50 rounded-xl text-outline/50 font-label text-sm hover:border-primary hover:text-primary transition-colors mt-2"
                        >
                          + Add Chapter Here
                        </button>
                      </div>
                    ))}
                    
                    {chapters.length === 0 && (
                      <div className="text-center py-16 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                        <FileText className="w-12 h-12 text-outline/50 mx-auto mb-4" />
                        <p className="text-outline font-label">No chapters yet. Upload a markdown file or add a chapter to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bilingual Editor */}
            {selectedChapter && (
              <div className="w-full h-full flex flex-col">
                <div className="flex items-center justify-between px-6 py-3 bg-surface border-b border-outline-variant">
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="text-sm font-label text-outline hover:text-primary transition-colors"
                  >
                    ← Back to chapters
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <BilingualEditor 
                    chapter={selectedChapter}
                    onSave={(updates) => handleSaveChapter(selectedChapter.id, updates)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && <Gallery isAdmin={true} />}

        {activeTab === 'moderation' && (
          <div className="p-8 overflow-y-auto h-full">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-headline text-on-surface mb-8">Moderation Queue</h2>
              
              {pendingCount === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-xl border border-outline-variant">
                  <MessageSquare className="w-12 h-12 text-outline/50 mx-auto mb-4" />
                  <p className="text-outline font-label">No pending annotations. All caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-outline font-label mb-4">{pendingCount} pending annotation{pendingCount !== 1 ? 's' : ''}</p>
                  
                  {pendingAnnotations.map(({ annotation, chapterId, chapterTitle, parentId, isGallery, galleryImageId, galleryImageCaption }) => (
                    <div key={annotation.id} className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-outline font-label mb-1">
                            On: <span className="text-on-surface font-medium">{chapterTitle}</span>
                            {isGallery && galleryImageCaption && (
                              <span className="text-primary"> • "{galleryImageCaption}"</span>
                            )}
                            {parentId && <span className="text-tertiary"> (reply)</span>}
                          </p>
                          <p className="text-xs text-outline font-label">
                            By: {annotation.author} • {new Date(annotation.timestamp).toLocaleString()}
                          </p>
                          {annotation.historicalDate && (
                            <p className="text-xs text-primary font-label mt-1">
                              Historical date: {annotation.historicalDate}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-label rounded-full">
                          Pending
                        </span>
                      </div>
                      
                      <div className="bg-surface-container-low rounded-lg p-4 mb-4">
                        <p className="text-on-surface font-body">{annotation.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleModerate(chapterId, annotation.id, 'approve', parentId, isGallery, galleryImageId)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-label text-sm hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerate(chapterId, annotation.id, 'reject', parentId, isGallery, galleryImageId)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md font-label text-sm hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'annotations' && (
          <AnnotationManager chapters={chapters} galleryImages={galleryImages} />
        )}

        {activeTab === 'ba-ngoai' && (
          <div className="p-8 overflow-y-auto h-full">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-headline text-on-surface">Bà Ngoại Gallery</h2>
                  <p className="text-outline font-label mt-1">Manage images and annotations for Bà Ngoại memorial</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-outline font-label">{baNgoaiImages.length} images</p>
                  <p className="text-xs text-outline font-label">
                    {baNgoaiImages.reduce((acc, img) => acc + (img.annotations?.filter(a => a.status === 'pending').length || 0), 0)} pending annotations
                  </p>
                </div>
              </div>

              {baNgoaiImages.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-low rounded-xl border border-outline-variant">
                  <ImageIcon className="w-12 h-12 text-outline/50 mx-auto mb-4" />
                  <p className="text-outline font-label">No images in Bà Ngoại gallery yet.</p>
                  <p className="text-sm text-outline/70 mt-2">Images uploaded by users will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {baNgoaiImages.map((image) => (
                    <div key={image.id} className="bg-white rounded-xl border border-outline-variant overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                          <img 
                            src={image.url} 
                            alt={image.caption}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-headline font-bold text-lg">{image.caption}</h3>
                              <p className="text-sm text-outline font-label mt-1">
                                Uploaded by {image.uploadedBy} on {new Date(image.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this image and all its annotations?')) return;
                                try {
                                  await deleteDoc(doc(db, 'ba-ngoai-gallery', image.id));
                                } catch (e) {
                                  console.error(e);
                                  alert('Failed to delete image.');
                                }
                              }}
                              className="p-2 text-outline hover:text-red-600 transition-colors"
                              title="Delete image"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Annotations */}
                          <div className="space-y-3">
                            <h4 className="font-label text-sm font-bold text-on-surface">
                              Annotations ({image.annotations?.length || 0})
                            </h4>
                            
                            {image.annotations && image.annotations.length > 0 ? (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {image.annotations.map((ann) => (
                                  <div key={ann.id} className="bg-surface-container-low p-3 rounded-lg">
                                    <p className="text-sm text-on-surface">{ann.content}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-outline font-label">{ann.author}</span>
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          "text-[10px] uppercase font-label px-2 py-0.5 rounded",
                                          ann.status === 'approved' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        )}>
                                          {ann.status}
                                        </span>
                                        {ann.status === 'pending' && (
                                          <>
                                            <button
                                              onClick={async () => {
                                                const newAnnotations = image.annotations?.map(a => 
                                                  a.id === ann.id ? { ...a, status: 'approved' as const } : a
                                                ) || [];
                                                try {
                                                  await updateDoc(doc(db, 'ba-ngoai-gallery', image.id), { annotations: newAnnotations });
                                                } catch (e) {
                                                  console.error(e);
                                                  alert('Failed to approve annotation.');
                                                }
                                              }}
                                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                                              title="Approve"
                                            >
                                              <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={async () => {
                                                const newAnnotations = image.annotations?.filter(a => a.id !== ann.id) || [];
                                                try {
                                                  await updateDoc(doc(db, 'ba-ngoai-gallery', image.id), { annotations: newAnnotations });
                                                } catch (e) {
                                                  console.error(e);
                                                  alert('Failed to reject annotation.');
                                                }
                                              }}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                                              title="Reject"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-outline italic">No annotations yet.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <ExperiencesAdmin chapters={chapters} galleryImages={galleryImages} />
        )}

        {activeTab === 'invites' && isAdmin && currentUser && (
          <div className="p-8 overflow-y-auto h-full">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-headline text-on-surface mb-8">Manage Invitations</h2>
              <InviteManager currentUserId={currentUser.uid} />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8 overflow-y-auto h-full">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-headline text-on-surface mb-8">Family Settings</h2>
              
              <div className="bg-white rounded-xl border border-outline-variant p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-headline font-bold text-lg">Whitelisted Members</h3>
                  <span className="ml-auto text-xs font-label bg-surface-container px-3 py-1 rounded-full text-outline">
                    {users.length} members
                  </span>
                </div>
                
                {users.length === 0 ? (
                  <p className="text-outline font-label text-center py-8">No family members added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                        <div>
                          <p className="font-label font-medium text-on-surface">{user.displayName}</p>
                          <p className="text-sm text-outline">{user.email}</p>
                        </div>
                        <span className={cn(
                          "text-xs font-label px-2 py-1 rounded",
                          user.role === 'admin' ? "bg-primary/10 text-primary" : "bg-surface text-outline"
                        )}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          if (!isAuthenticated) {
            // Redirect to home if not authenticated
            window.location.href = '/';
          }
        }} 
      />
    </div>
  );
}

// Editable Title Component
function EditableTitle({ title, onSave }: { title: string; onSave: (newTitle: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className="font-headline font-bold text-lg text-on-surface bg-surface-container-low border border-primary rounded px-2 py-1 w-full"
      />
    );
  }

  return (
    <h3 
      onClick={() => setIsEditing(true)}
      className="font-headline font-bold text-lg text-on-surface cursor-pointer hover:text-primary transition-colors"
      title="Click to edit"
    >
      {title}
    </h3>
  );
}

// Experiences Admin Component
function ExperiencesAdmin({ chapters, galleryImages }: { chapters: Chapter[]; galleryImages: GalleryImage[] }) {
  const [activeSubTab, setActiveSubTab] = useState<'chorus' | 'timeline' | 'voices'>('chorus');
  const [editingAnnotation, setEditingAnnotation] = useState<{chapterId: string, annId: string, content: string} | null>(null);

  // Get all annotations for Chorus (targeted annotations)
  const chorusAnnotations = chapters.flatMap(ch => 
    (ch.annotations || [])
      .filter(a => a.targetId && a.status === 'approved')
      .map(a => ({ ...a, chapterId: ch.id, chapterTitle: ch.title }))
  );

  // Get all Distant Voices (non-targeted annotations)
  const distantVoices = chapters.flatMap(ch => 
    (ch.annotations || [])
      .filter(a => !a.targetId && a.status === 'approved')
      .map(a => ({ ...a, chapterId: ch.id, chapterTitle: ch.title }))
  );

  // Calculate timeline events
  const timelineEvents = React.useMemo(() => {
    let events: any[] = [];
    
    chapters.forEach((chapter, index) => {
      events.push({
        type: 'chapter',
        id: chapter.id,
        title: chapter.title,
        content: chapter.contentEn?.replace(/[#*]/g, '').substring(0, 200) + '...',
        author: 'Grandfather',
        epochIndex: index,
        sortDate: chapter.timestamp || new Date(2000, index, 1).toISOString(),
      });

      if (chapter.annotations) {
        chapter.annotations.filter(a => a.status === 'approved').forEach(ann => {
          const isVoice = !ann.targetId;
          events.push({
            type: isVoice ? 'voice' : 'annotation',
            id: ann.id,
            title: isVoice ? 'Distant Voice' : 'Text Annotation',
            content: ann.content,
            author: ann.author,
            historicalDate: ann.historicalDate,
            sortDate: ann.historicalDate ? new Date(ann.historicalDate + '-01').toISOString() : ann.timestamp,
            targetChapter: index,
            targetNodeId: ann.targetId,
            chapterId: chapter.id
          });
        });
      }
    });

    galleryImages.forEach(img => {
      events.push({
        type: 'photo',
        id: img.id,
        title: 'Visual Artifact',
        content: img.caption || 'A photo was added to the repository.',
        author: img.uploadedBy,
        historicalDate: img.historicalDate,
        sortDate: img.historicalDate ? new Date(img.historicalDate + '-01').toISOString() : img.uploadedAt,
        url: img.url
      });

      if (img.annotations) {
        img.annotations.filter(a => a.status === 'approved').forEach(ann => {
          events.push({
            type: 'photo_annotation',
            id: ann.id,
            title: 'Artifact Reflection',
            content: ann.content,
            author: ann.author,
            sortDate: ann.timestamp,
            targetNodeId: `img-${img.id}`
          });
        });
      }
    });

    return events.sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
  }, [chapters, galleryImages]);

  const handleDeleteAnnotation = async (chapterId: string, annotationId: string, isReply: boolean = false, parentId?: string) => {
    if (!confirm('Delete this annotation?')) return;
    
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    try {
      if (isReply && parentId) {
        // Delete reply from parent
        const updateReplies = (anns: Annotation[]): Annotation[] => {
          return anns.map(ann => {
            if (ann.id === parentId && ann.replies) {
              return { ...ann, replies: ann.replies.filter(r => r.id !== annotationId) };
            }
            if (ann.replies) {
              return { ...ann, replies: updateReplies(ann.replies) };
            }
            return ann;
          });
        };
        await updateDoc(doc(db, 'chapters', chapterId), { 
          annotations: updateReplies(chapter.annotations || []) 
        });
      } else {
        // Delete top-level annotation
        const newAnnotations = (chapter.annotations || []).filter(a => a.id !== annotationId);
        await updateDoc(doc(db, 'chapters', chapterId), { annotations: newAnnotations });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete annotation.');
    }
  };

  const handleEditAnnotation = async (chapterId: string, annotationId: string, newContent: string, isReply: boolean = false, parentId?: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    try {
      if (isReply && parentId) {
        const updateReplies = (anns: Annotation[]): Annotation[] => {
          return anns.map(ann => {
            if (ann.id === parentId && ann.replies) {
              return { 
                ...ann, 
                replies: ann.replies.map(r => r.id === annotationId ? { ...r, content: newContent } : r) 
              };
            }
            if (ann.replies) {
              return { ...ann, replies: updateReplies(ann.replies) };
            }
            return ann;
          });
        };
        await updateDoc(doc(db, 'chapters', chapterId), { 
          annotations: updateReplies(chapter.annotations || []) 
        });
      } else {
        const newAnnotations = (chapter.annotations || []).map(a => 
          a.id === annotationId ? { ...a, content: newContent } : a
        );
        await updateDoc(doc(db, 'chapters', chapterId), { annotations: newAnnotations });
      }
      setEditingAnnotation(null);
    } catch (e) {
      console.error(e);
      alert('Failed to edit annotation.');
    }
  };

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-headline text-on-surface">Experiences</h2>
            <p className="text-outline font-label mt-1">Manage Chorus, Timeline, and Distant Voices</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 mb-8 border-b border-outline-variant pb-4">
          <button
            onClick={() => setActiveSubTab('chorus')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-label text-sm transition-colors",
              activeSubTab === 'chorus' 
                ? "bg-primary text-on-primary" 
                : "text-outline hover:bg-surface-container"
            )}
          >
            <Users className="w-4 h-4" />
            Chorus ({chorusAnnotations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-label text-sm transition-colors",
              activeSubTab === 'timeline' 
                ? "bg-primary text-on-primary" 
                : "text-outline hover:bg-surface-container"
            )}
          >
            <History className="w-4 h-4" />
            Timeline ({timelineEvents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('voices')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-label text-sm transition-colors",
              activeSubTab === 'voices' 
                ? "bg-primary text-on-primary" 
                : "text-outline hover:bg-surface-container"
            )}
          >
            <Radio className="w-4 h-4" />
            Distant Voices ({distantVoices.length})
          </button>
        </div>

        {/* Chorus Tab */}
        {activeSubTab === 'chorus' && (
          <div className="space-y-4">
            <p className="text-sm text-outline font-label mb-4">
              Targeted annotations linked to specific paragraphs in chapters.
            </p>
            {chorusAnnotations.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-low rounded-xl border border-outline-variant">
                <Users className="w-12 h-12 text-outline/50 mx-auto mb-4" />
                <p className="text-outline font-label">No Chorus annotations yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {chorusAnnotations.map((ann) => (
                  <div key={ann.id} className="bg-white rounded-xl border border-outline-variant p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-label text-xs font-bold text-primary uppercase tracking-wider">
                            {ann.author}
                          </span>
                          <span className="text-xs text-outline">•</span>
                          <span className="font-label text-xs text-outline">
                            {ann.chapterTitle}
                          </span>
                          <span className="text-xs text-outline">•</span>
                          <span className="font-label text-xs text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">
                            Target: {ann.targetId}
                          </span>
                        </div>
                        <p className="text-xs text-outline">
                          {new Date(ann.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingAnnotation({chapterId: ann.chapterId, annId: ann.id, content: ann.content})}
                          className="p-2 text-outline hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnotation(ann.chapterId, ann.id)}
                          className="p-2 text-outline hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {editingAnnotation?.annId === ann.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingAnnotation.content}
                          onChange={(e) => setEditingAnnotation({...editingAnnotation, content: e.target.value})}
                          className="w-full p-3 text-sm bg-surface border border-outline-variant rounded-md resize-none h-24"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAnnotation(ann.chapterId, ann.id, editingAnnotation.content)}
                            className="px-3 py-1 bg-primary text-on-primary rounded text-sm font-label"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAnnotation(null)}
                            className="px-3 py-1 text-outline hover:text-on-surface text-sm font-label"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-on-surface font-body">"{ann.content}"</p>
                    )}

                    {/* Replies */}
                    {ann.replies && ann.replies.length > 0 && (
                      <div className="mt-4 ml-6 pl-4 border-l-2 border-outline-variant space-y-3">
                        <p className="text-xs font-label text-outline uppercase tracking-wider">Replies</p>
                        {ann.replies.map(reply => (
                          <div key={reply.id} className="bg-surface-container-low p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-label text-xs text-primary">{reply.author}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingAnnotation({chapterId: ann.chapterId, annId: reply.id, content: reply.content})}
                                  className="p-1 text-outline hover:text-primary"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAnnotation(ann.chapterId, reply.id, true, ann.id)}
                                  className="p-1 text-outline hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {editingAnnotation?.annId === reply.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingAnnotation.content}
                                  onChange={(e) => setEditingAnnotation({...editingAnnotation, content: e.target.value})}
                                  className="w-full p-2 text-sm bg-surface border border-outline-variant rounded resize-none h-16"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditAnnotation(ann.chapterId, reply.id, editingAnnotation.content, true, ann.id)}
                                    className="px-2 py-0.5 bg-primary text-on-primary rounded text-xs font-label"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingAnnotation(null)}
                                    className="px-2 py-0.5 text-outline hover:text-on-surface text-xs font-label"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-on-surface italic">"{reply.content}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeSubTab === 'timeline' && (
          <div className="space-y-4">
            <p className="text-sm text-outline font-label mb-4">
              Chronological view of all events: chapters, annotations, photos, and reflections.
            </p>
            <div className="relative">
              {/* Timeline spine */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-tertiary to-outline-variant" />
              
              <div className="space-y-6">
                {timelineEvents.map((ev, index) => {
                  const isChapter = ev.type === 'chapter';
                  const isVoice = ev.type === 'voice';
                  const isPhoto = ev.type === 'photo';
                  const isPhotoAnn = ev.type === 'photo_annotation';
                  
                  const dotColor = isChapter ? 'bg-primary' : isVoice ? 'bg-tertiary' : 'bg-outline';
                  
                  const renderDate = () => {
                    if (ev.historicalDate) {
                      const d = new Date(ev.historicalDate + '-01');
                      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }
                    if (isChapter) return `Epoch ${ev.epochIndex + 1}`;
                    return new Date(ev.sortDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  };

                  return (
                    <div key={ev.id + index} className="relative flex items-start gap-4 ml-2">
                      <div className={cn("w-4 h-4 rounded-full border-2 border-surface z-10 flex-shrink-0 mt-1", dotColor)} />
                      <div className="flex-1 bg-surface-container-low rounded-lg p-4 border border-outline-variant">
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-xs font-label uppercase tracking-wider px-2 py-0.5 rounded",
                            isChapter ? "bg-primary/10 text-primary" : 
                            isVoice ? "bg-tertiary/10 text-tertiary" : "bg-outline/10 text-outline"
                          )}>
                            {isChapter ? 'Chapter' : isVoice ? 'Distant Voice' : isPhoto ? 'Photo' : isPhotoAnn ? 'Photo Note' : 'Annotation'}
                          </span>
                          <span className="text-xs text-outline font-label">{renderDate()}</span>
                        </div>
                        <p className="font-body text-sm text-on-surface">
                          {isChapter ? ev.content.substring(0, 150) + '...' : `"${ev.content.substring(0, 200)}${ev.content.length > 200 ? '...' : ''}"`}
                        </p>
                        {ev.author && (
                          <p className="text-xs text-outline mt-2 font-label">— {ev.author}</p>
                        )}
                        {ev.chapterTitle && !isChapter && (
                          <p className="text-xs text-outline/70 mt-1 font-label">in "{ev.chapterTitle}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Distant Voices Tab */}
        {activeSubTab === 'voices' && (
          <div className="space-y-4">
            <p className="text-sm text-outline font-label mb-4">
              Macro-scale reflections and holistic memories detached from specific text passages.
            </p>
            {distantVoices.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-low rounded-xl border border-outline-variant">
                <Radio className="w-12 h-12 text-outline/50 mx-auto mb-4" />
                <p className="text-outline font-label">No Distant Voices yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {distantVoices.map((voice) => (
                  <div key={voice.id} className="bg-white rounded-xl border border-outline-variant p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-label text-xs font-bold text-tertiary uppercase tracking-wider">
                            {voice.author}
                          </span>
                          <span className="text-xs text-outline">•</span>
                          <span className="font-label text-xs text-outline">
                            {voice.chapterTitle}
                          </span>
                          {voice.historicalDate && (
                            <>
                              <span className="text-xs text-outline">•</span>
                              <span className="font-label text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {new Date(voice.historicalDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-outline">
                          {new Date(voice.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingAnnotation({chapterId: voice.chapterId, annId: voice.id, content: voice.content})}
                          className="p-2 text-outline hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnotation(voice.chapterId, voice.id)}
                          className="p-2 text-outline hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {editingAnnotation?.annId === voice.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingAnnotation.content}
                          onChange={(e) => setEditingAnnotation({...editingAnnotation, content: e.target.value})}
                          className="w-full p-3 text-sm bg-surface border border-outline-variant rounded-md resize-none h-24"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAnnotation(voice.chapterId, voice.id, editingAnnotation.content)}
                            className="px-3 py-1 bg-primary text-on-primary rounded text-sm font-label"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAnnotation(null)}
                            className="px-3 py-1 text-outline hover:text-on-surface text-sm font-label"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-on-surface font-body italic text-lg">"{voice.content}"</p>
                    )}

                    {/* Replies */}
                    {voice.replies && voice.replies.length > 0 && (
                      <div className="mt-4 ml-6 pl-4 border-l-2 border-outline-variant space-y-3">
                        <p className="text-xs font-label text-outline uppercase tracking-wider">Replies</p>
                        {voice.replies.map(reply => (
                          <div key={reply.id} className="bg-surface-container-low p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-label text-xs text-primary">{reply.author}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingAnnotation({chapterId: voice.chapterId, annId: reply.id, content: reply.content})}
                                  className="p-1 text-outline hover:text-primary"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAnnotation(voice.chapterId, reply.id, true, voice.id)}
                                  className="p-1 text-outline hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            {editingAnnotation?.annId === reply.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingAnnotation.content}
                                  onChange={(e) => setEditingAnnotation({...editingAnnotation, content: e.target.value})}
                                  className="w-full p-2 text-sm bg-surface border border-outline-variant rounded resize-none h-16"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditAnnotation(voice.chapterId, reply.id, editingAnnotation.content, true, voice.id)}
                                    className="px-2 py-0.5 bg-primary text-on-primary rounded text-xs font-label"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingAnnotation(null)}
                                    className="px-2 py-0.5 text-outline hover:text-on-surface text-xs font-label"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-on-surface italic">"{reply.content}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label,
  badge
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  badge?: number;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left font-label",
        active 
          ? "bg-primary text-on-primary font-medium" 
          : "text-on-surface hover:bg-surface-container opacity-70 hover:opacity-100"
      )}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {badge !== undefined && (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          active ? "bg-white/20" : "bg-primary/10 text-primary"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}
