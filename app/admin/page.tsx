'use client';

import React, { useState, useEffect } from 'react';
import { Upload, MessageSquare, Settings, Check, X, FileText, Save, Image as ImageIcon, Trash2, UserPlus, Shield } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Chapter } from '../../types';
import { cn } from '../../lib/utils';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'content' | 'moderation' | 'settings'>('content');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'family' | 'admin'>('family');
  const [newVoiceChapterId, setNewVoiceChapterId] = useState('');
  const [newVoiceContent, setNewVoiceContent] = useState('');
  const [newVoiceHistoricalDate, setNewVoiceHistoricalDate] = useState('');
  const [newVoiceTransmissionDate, setNewVoiceTransmissionDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', contentVi: '', contentEn: '' });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'contentVi' | 'contentEn') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/admin/image', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        setEditForm(prev => ({ ...prev, [targetField]: prev[targetField] + `\n\n![](${data.downloadURL})\n\n` }));
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Upload request failed.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'chapters'), orderBy('order', 'asc'));
    const unsubscribeChapters = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => doc.data() as Chapter);
      setChapters(loaded);
    });

    const uq = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(uq, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeChapters();
      unsubscribeUsers();
    };
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserDisplayName) return;
    try {
      await addDoc(collection(db, 'users'), {
        email: newUserEmail.toLowerCase(),
        displayName: newUserDisplayName,
        role: newUserRole,
        createdAt: new Date().toISOString()
      });
      setNewUserEmail('');
      setNewUserDisplayName('');
    } catch (error) {
      console.error(error);
      alert('Failed to add user');
    }
  };

  const handleRemoveUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      console.error(error);
      alert('Failed to remove user');
    }
  };

  const handleEditChapter = async (chapterId: string) => {
    try {
      const chapterRef = doc(db, 'chapters', chapterId);
      await updateDoc(chapterRef, editForm);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert('Failed to save chapter.');
    }
  };

  const handleAddDistantVoice = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newVoiceChapterId || !newVoiceContent) return;
     const chapter = chapters.find(c => c.id === newVoiceChapterId);
     if (!chapter) return;
     
     const newAnnotation = {
       id: Math.random().toString(36).substr(2, 9),
       author: 'Family Historian',
       content: newVoiceContent,
       historicalDate: newVoiceHistoricalDate || undefined,
       timestamp: newVoiceTransmissionDate ? new Date(newVoiceTransmissionDate).toISOString() : new Date().toISOString(),
       era: 'present' as const,
       status: 'approved' as const
     };

     const newAnnotations = [newAnnotation, ...(chapter.annotations || [])];
     try {
       await updateDoc(doc(db, 'chapters', newVoiceChapterId), { annotations: newAnnotations });
       setNewVoiceContent('');
       setNewVoiceHistoricalDate('');
       alert('Distant Voice correctly routed into the collective ether!');
     } catch (err) {
       console.error(err);
       alert('Transmission failed. Check connections.');
     }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isTranslation: boolean = false) => {
    const file = e.target.files?.[0];
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
          body: JSON.stringify({ fileName: file.name, isTranslation })
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

  const getAllPendingAnnotations = (chaptersList: Chapter[]) => {
    let pending: any[] = [];
    
    const extractPending = (annotations: any[], chapterId: string, chapterTitle: string, parentContent?: string) => {
      annotations.forEach((ann: any) => {
        if (ann.status === 'pending') {
          pending.push({ ...ann, chapterId, chapterTitle, parentContent });
        }
        if (ann.replies) {
          extractPending(ann.replies, chapterId, chapterTitle, ann.content);
        }
      });
    };

    chaptersList.forEach(ch => {
      if (ch.annotations) extractPending(ch.annotations, ch.id, ch.title);
    });
    
    return pending;
  };

  const pendingModerations = getAllPendingAnnotations(chapters);

  const handleModerate = async (chapterId: string, annotationId: string, action: 'approve' | 'reject') => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const processTree = (annotations: any[]): any[] => {
      return annotations.filter(a => !(action === 'reject' && a.id === annotationId)).map(a => {
        if (a.id === annotationId && action === 'approve') {
          return { ...a, status: 'approved' };
        }
        if (a.replies) {
          return { ...a, replies: processTree(a.replies) };
        }
        return a;
      });
    };

    const newAnnotations = processTree(chapter.annotations || []);
    try {
      await updateDoc(doc(db, 'chapters', chapterId), { annotations: newAnnotations });
    } catch (e) {
      console.error(e);
      alert('Failed to update moderation status.');
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
                <h4 className="font-bold text-on-surface mb-3 font-headline text-lg">Vietnamese Original</h4>
                <label className="bg-primary text-on-primary px-6 py-2 rounded-md font-label font-medium cursor-pointer hover:scale-105 transition-transform active:scale-95">
                  {isUploading ? '...' : 'Select Vietnamese .md'}
                  <input type="file" accept=".md,.txt" className="hidden" disabled={isUploading} onChange={(e) => handleFileUpload(e, false)} />
                </label>
                {uploadMessage && !uploadMessage.includes('mapped translation') && <p className="mt-4 text-sm font-label text-tertiary max-w-[250px] mx-auto">{uploadMessage}</p>}
              </div>

              <div className="border-2 border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center bg-surface-container-low/50 hover:bg-surface-container-low transition-colors mt-6">
                <Upload className="w-10 h-10 text-primary mb-4 opacity-70" />
                <h4 className="font-bold text-on-surface mb-3 font-headline text-lg">English Translation Archive</h4>
                <label className="bg-primary text-on-primary px-6 py-2 rounded-md font-label font-medium cursor-pointer hover:scale-105 transition-transform active:scale-95">
                  {isUploading ? '...' : 'Select English Translation .md'}
                  <input type="file" accept=".md,.txt" className="hidden" disabled={isUploading} onChange={(e) => handleFileUpload(e, true)} />
                </label>
                {uploadMessage && uploadMessage.includes('mapped translation') && <p className="mt-4 text-sm font-label text-tertiary">{uploadMessage}</p>}
              </div>
            </div>
            
            <div className="mt-12 bg-white rounded-xl border border-outline-variant p-8 shadow-sm">
               <h3 className="text-lg font-bold font-label mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-tertiary" /> Transmit a Distant Voice</h3>
               <p className="text-outline text-sm mb-6">Manually push an overarching contextual reflection straight into the Distant Voices layer of a chapter. Mod queues are completely bypassed.</p>
               <form onSubmit={handleAddDistantVoice} className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Target Chapter</label>
                   <select value={newVoiceChapterId} onChange={e => setNewVoiceChapterId(e.target.value)} required className="w-full p-3 border border-outline-variant rounded text-sm font-headline bg-white cursor-pointer">
                     <option value="" disabled>Select a routing origin...</option>
                     {chapters.map(ch => (
                       <option key={ch.id} value={ch.id}>{ch.title}</option>
                     ))}
                   </select>
                 </div>
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Historical Timestamp (Month/Year)</label>
                     <input type="month" value={newVoiceHistoricalDate} onChange={e => setNewVoiceHistoricalDate(e.target.value)} required className="w-full p-3 border border-outline-variant rounded font-body text-sm bg-white" />
                     <p className="text-[10px] uppercase tracking-widest text-outline mt-2 font-label">Tethers this pulse to the main historic timeline.</p>
                   </div>
                   <div className="flex-1">
                     <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Transmission Date Override</label>
                     <input type="date" value={newVoiceTransmissionDate} onChange={e => setNewVoiceTransmissionDate(e.target.value)} required className="w-full p-3 border border-outline-variant rounded font-body text-sm bg-white" />
                     <p className="text-[10px] uppercase tracking-widest text-outline mt-2 font-label">Defaults to today, but can be spoofed or backdated.</p>
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Content Transmission</label>
                   <textarea rows={4} value={newVoiceContent} onChange={e => setNewVoiceContent(e.target.value)} required placeholder={`"In the winter of the third decade, finding food meant pulling secrets strictly out of the dry sod..."`} className="w-full p-3 border border-outline-variant rounded font-body text-sm italic" />
                 </div>
                 <button type="submit" className="bg-tertiary text-white px-6 py-3 rounded font-label hover:bg-tertiary/90 transition-colors font-medium text-sm border-0 cursor-pointer">
                   Beam Message
                 </button>
               </form>
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
                         
                         <div className="flex justify-between items-center mt-4">
                           <label className="text-xs font-bold text-outline uppercase tracking-wider block">Vietnamese Original</label>
                           <label className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1 active:scale-95">
                             <ImageIcon className="w-3 h-3" /> {isUploadingImage ? '...' : 'Insert Photo'}
                             <input type="file" accept="image/*" className="hidden" disabled={isUploadingImage} onChange={e => handleImageUpload(e, 'contentVi')} />
                           </label>
                         </div>
                         <textarea 
                           rows={6}
                           value={editForm.contentVi} 
                           onChange={e => setEditForm({...editForm, contentVi: e.target.value})} 
                           className="w-full p-3 border border-outline-variant rounded font-body text-sm mt-1"
                         />
                         
                         <div className="flex justify-between items-center mt-4">
                           <label className="text-xs font-bold text-outline uppercase tracking-wider block">English Translation (Memoir Layer)</label>
                           <label className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1 active:scale-95">
                             <ImageIcon className="w-3 h-3" /> {isUploadingImage ? '...' : 'Insert Photo'}
                             <input type="file" accept="image/*" className="hidden" disabled={isUploadingImage} onChange={e => handleImageUpload(e, 'contentEn')} />
                           </label>
                         </div>
                         <textarea 
                           rows={6}
                           value={editForm.contentEn} 
                           onChange={e => setEditForm({...editForm, contentEn: e.target.value})} 
                           className="w-full p-3 border border-outline-variant rounded font-body text-sm mt-1"
                           placeholder="Type the English translation here..."
                         />
                         
                         <div className="flex flex-row-reverse pt-2">
                           <div className="flex gap-2">
                             <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded text-outline font-label text-sm hover:bg-surface-variant transition-colors cursor-pointer">Cancel</button>
                             <button onClick={() => handleEditChapter(ch.id)} className="px-4 py-2 rounded bg-primary font-label text-sm text-on-primary flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer">
                               <Save className="w-4 h-4" /> Save Changes
                             </button>
                           </div>
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
            
            <div className="space-y-4">
              {pendingModerations.length === 0 ? (
                <p className="text-sm text-outline italic py-8">No pending annotations in the queue.</p>
              ) : (
                pendingModerations.map(pm => (
                  <div key={pm.id} className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-sm bg-surface-container px-2 py-1 rounded">{pm.author}</span>
                        <span className="text-xs text-outline">
                          in {pm.chapterTitle} {pm.parentContent ? `(Replying to: "${pm.parentContent.substring(0,30)}...")` : ''}
                        </span>
                      </div>
                      <p className="font-body text-lg italic text-on-surface leading-relaxed">
                        "{pm.content}"
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleModerate(pm.chapterId, pm.id, 'approve')} className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-full transition-colors cursor-pointer" title="Approve">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleModerate(pm.chapterId, pm.id, 'reject')} className="p-2 bg-red-50 text-tertiary hover:bg-red-100 rounded-full transition-colors cursor-pointer" title="Reject">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-headline text-on-surface mb-6">Family Settings</h2>
            
            <div className="bg-white rounded-xl border border-outline-variant p-8 shadow-sm mb-8">
              <h3 className="text-lg font-bold font-label mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Invite Family Member</h3>
              <form onSubmit={handleAddUser} className="flex gap-4 items-end flex-wrap">
                <div className="flex-[2] min-w-[200px]">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Display Name</label>
                  <input type="text" value={newUserDisplayName} onChange={e => setNewUserDisplayName(e.target.value)} required placeholder="Auntie Linh" className="w-full p-3 border border-outline-variant rounded font-body text-sm" />
                </div>
                <div className="flex-[3] min-w-[200px]">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Email Address</label>
                  <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required placeholder="cousin@example.com" className="w-full p-3 border border-outline-variant rounded font-body text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">Role Status</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as 'admin'|'family')} className="p-3 border border-outline-variant rounded text-sm font-label bg-white appearance-none min-w-[150px]">
                    <option value="family">Family (Reader)</option>
                    <option value="admin">Moderator (Admin)</option>
                  </select>
                </div>
                <button type="submit" className="bg-primary text-on-primary px-6 py-3 rounded font-label hover:bg-primary-container transition-colors font-medium text-sm">Add User</button>
              </form>
            </div>

            <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
               <div className="p-6 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                 <h3 className="font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Whitelisted Access Registry</h3>
                 <span className="text-xs font-bold font-label bg-white px-3 py-1 rounded-full text-outline-variant text-tertiary">{users.length} Active Members</span>
               </div>
               <div className="divide-y divide-outline-variant">
                 {users.map(user => (
                   <div key={user.id} className="p-6 flex items-center justify-between hover:bg-surface/50 transition-colors">
                     <div>
                       <h4 className="font-bold text-on-surface text-lg font-headline">{user.displayName} <span className="font-body text-sm text-outline ml-2 font-normal">({user.email})</span></h4>
                       <p className="text-sm text-outline capitalize font-label mt-1">Role: <span className={cn("font-bold", user.role === 'admin' ? "text-primary" : "text-tertiary")}>{user.role}</span></p>
                     </div>
                     <button onClick={() => handleRemoveUser(user.id)} className="p-2 text-outline hover:text-tertiary hover:bg-red-50 rounded transition-colors" title="Revoke Access">
                       <Trash2 className="w-5 h-5" />
                     </button>
                   </div>
                 ))}
                 {users.length === 0 && <p className="p-8 text-center text-outline italic">No family members have been whitelisted yet.</p>}
               </div>
            </div>
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
