'use client';

import React, { useState, useEffect } from 'react';
import { Upload, MessageSquare, Settings, FileText, Image as ImageIcon, Users, BookOpen } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Chapter } from '../../types';
import { cn } from '../../lib/utils';
import BilingualEditor from '../../components/BilingualEditor';
import Gallery from '../../components/Gallery';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'chapters' | 'gallery' | 'moderation' | 'settings'>('chapters');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

    return () => {
      unsubscribeChapters();
      unsubscribeUsers();
    };
  }, [selectedChapter?.id]);

  const handleSaveChapter = async (chapterId: string, updates: { contentVi: string; contentEn: string }) => {
    try {
      await updateDoc(doc(db, 'chapters', chapterId), updates);
    } catch (e) {
      console.error('Failed to save chapter:', e);
      throw e;
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

  // Calculate pending moderations
  const getPendingCount = () => {
    let count = 0;
    chapters.forEach(ch => {
      const checkAnnotations = (anns: any[]) => {
        anns.forEach(a => {
          if (a.status === 'pending') count++;
          if (a.replies) checkAnnotations(a.replies);
        });
      };
      if (ch.annotations) checkAnnotations(ch.annotations);
    });
    return count;
  };

  const pendingCount = getPendingCount();

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
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setSelectedChapter(null); }}
            icon={<Settings className="w-5 h-5" />}
            label="Family Settings"
          />
        </div>
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
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => setSelectedChapter(chapter)}
                        className="w-full text-left p-4 bg-white rounded-xl border border-outline-variant hover:border-primary/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-headline font-bold text-lg text-on-surface">{chapter.title}</h3>
                            <p className="text-sm text-outline font-label mt-1">{chapter.year}</p>
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
                      </button>
                    ))}
                    
                    {chapters.length === 0 && (
                      <div className="text-center py-16 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                        <FileText className="w-12 h-12 text-outline/50 mx-auto mb-4" />
                        <p className="text-outline font-label">No chapters yet. Upload a markdown file to get started.</p>
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

        {activeTab === 'gallery' && <Gallery />}

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
                <p className="text-outline font-label mb-4">{pendingCount} pending annotations</p>
              )}
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
