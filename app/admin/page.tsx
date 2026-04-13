'use client';

import React, { useState, useEffect } from 'react';
import { Upload, MessageSquare, Settings, Check, X, FileText, Save } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Chapter } from '../../types';
import { cn } from '../../lib/utils';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'content' | 'moderation' | 'settings'>('content');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', contentVi: '', contentEn: '' });

  useEffect(() => {
    const q = query(collection(db, 'chapters'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => doc.data() as Chapter);
      setChapters(loaded);
    });
    return () => unsubscribe();
  }, []);

  const handleEditChapter = async (chapterId: string) => {
    try {
      const chapterRef = doc(db, 'chapters', chapterId);
      await updateDoc(chapterRef, editForm);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert('Failed to update chapter');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage('Uploading...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadMessage(`⏳ Uploaded! Parsing markdown into database...`);
        
        // Step 2: Parse raw text into structured Database Chapters
        const parseResponse = await fetch('/api/admin/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name })
        });
        
        const parseData = await parseResponse.json();
        
        if(parseData.success) {
          setUploadMessage(`✅ Success! ${parseData.message}`);
        } else {
          setUploadMessage(`❌ Parse Error: ${parseData.error}`);
        }
      } else {
        setUploadMessage(`❌ Upload Error: ${data.error}`);
      }
    } catch (error) {
      setUploadMessage('❌ Failed to connect to server.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-primary italic">Control Panel</h1>
          <p className="text-sm text-outline mt-1 font-label">The Living Archive</p>
        </div>

        <div className="flex flex-col gap-2">
          <TabButton 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')}
            icon={<FileText className="w-5 h-5" />}
            label="Content Manager"
          />
          <TabButton 
            active={activeTab === 'moderation'} 
            onClick={() => setActiveTab('moderation')}
            icon={<MessageSquare className="w-5 h-5" />}
            label="Moderation Queue"
          />
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={<Settings className="w-5 h-5" />}
            label="Family Settings"
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {activeTab === 'content' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-headline text-on-surface mb-6">Content Manager</h2>
            
            <div className="bg-white rounded-xl border border-outline-variant p-8 shadow-sm">
              <h3 className="text-lg font-bold font-label mb-2">Upload Markdown Source</h3>
              <p className="text-outline text-sm mb-6">
                Upload new \`.md\` files. The system will automatically parse headers, Vietnamese/English translations, and layer delineations.
              </p>

              <div className="border-2 border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
                <Upload className="w-10 h-10 text-primary mb-4 opacity-70" />
                <label className="bg-primary text-on-primary px-6 py-2 rounded-md font-label font-medium cursor-pointer hover:bg-primary-container transition-transform active:scale-95">
                  {isUploading ? '...' : 'Select File'}
                  <input type="file" accept=".md,.txt" className="hidden" disabled={isUploading} onChange={handleFileUpload} />
                </label>
                {uploadMessage && <p className="mt-4 text-sm font-label text-tertiary">{uploadMessage}</p>}
              </div>
            </div>
            
            <div className="mt-12 bg-white rounded-xl border border-outline-variant p-8 shadow-sm">
               <h3 className="text-lg font-bold font-label mb-6">Existing Chapters</h3>
               
               <div className="space-y-6">
                 {chapters.map(ch => (
                   <div key={ch.id} className="p-4 border border-outline-variant rounded-lg bg-surface-container-low/30">
                     {editingId === ch.id ? (
                       <div className="space-y-4">
                         <label className="text-xs font-bold text-outline uppercase tracking-wider">Chapter Title</label>
                         <input 
                           type="text" 
                           value={editForm.title} 
                           onChange={e => setEditForm({...editForm, title: e.target.value})} 
                           className="w-full p-2 border border-outline-variant rounded shrink font-headline"
                         />
                         
                         <label className="text-xs font-bold text-outline uppercase tracking-wider block mt-4">Vietnamese Original</label>
                         <textarea 
                           rows={6}
                           value={editForm.contentVi} 
                           onChange={e => setEditForm({...editForm, contentVi: e.target.value})} 
                           className="w-full p-3 border border-outline-variant rounded font-body text-sm"
                         />
                         
                         <label className="text-xs font-bold text-outline uppercase tracking-wider block mt-4">English Translation (Memoir Layer)</label>
                         <textarea 
                           rows={6}
                           value={editForm.contentEn} 
                           onChange={e => setEditForm({...editForm, contentEn: e.target.value})} 
                           className="w-full p-3 border border-outline-variant rounded font-body text-sm"
                           placeholder="Type the English translation here..."
                         />
                         
                         <div className="flex justify-end gap-2 pt-2">
                           <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded text-outline font-label text-sm hover:bg-surface-variant transition-colors cursor-pointer">Cancel</button>
                           <button onClick={() => handleEditChapter(ch.id)} className="px-4 py-2 rounded bg-primary font-label text-sm text-on-primary flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer">
                             <Save className="w-4 h-4" /> Save Changes
                           </button>
                         </div>
                       </div>
                     ) : (
                       <div>
                         <div className="flex justify-between items-center mb-2">
                           <h4 className="font-bold text-lg font-headline truncate pr-4">{ch.title}</h4>
                           <button 
                             onClick={() => {
                               setEditingId(ch.id);
                               setEditForm({ title: ch.title, contentVi: ch.contentVi, contentEn: ch.contentEn || '' });
                             }}
                             className="text-sm font-label text-primary hover:bg-primary hover:text-on-primary transition-colors px-4 py-1.5 bg-primary/10 rounded-full cursor-pointer shrink-0"
                           >
                             Edit Block
                           </button>
                         </div>
                         <p className="text-sm text-outline font-body line-clamp-3 mb-2">{ch.contentVi}</p>
                         {ch.contentEn && <p className="text-sm text-primary/70 font-body line-clamp-2 border-l-2 border-primary/20 pl-3">En: {ch.contentEn}</p>}
                       </div>
                     )}
                   </div>
                 ))}
                 {chapters.length === 0 && <p className="text-sm text-outline italic text-center py-8">No chapters discovered in database.</p>}
               </div>
            </div>
          </section>
        )}

        {activeTab === 'moderation' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-headline text-on-surface mb-6">Moderation Queue</h2>
            
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-sm bg-surface-container px-2 py-1 rounded">Auntie Linh</span>
                  <span className="text-xs text-outline">in Chapter 1 (Past)</span>
                </div>
                <p className="font-body text-lg italic text-on-surface leading-relaxed">
                  "Ba used to tell us to be quiet so we wouldn't wake the silver scales..."
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-full transition-colors cursor-pointer" title="Approve">
                  <Check className="w-5 h-5" />
                </button>
                <button className="p-2 bg-red-50 text-tertiary hover:bg-red-100 rounded-full transition-colors cursor-pointer" title="Reject">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-headline text-on-surface mb-6">Family Settings</h2>
            <p className="text-outline">Manage whitelisted emails and user access permissions.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-label",
        active 
          ? "bg-primary text-on-primary font-medium" 
          : "text-on-surface hover:bg-surface-container opacity-70 hover:opacity-100"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
