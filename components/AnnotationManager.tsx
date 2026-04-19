'use client';

import React, { useState, useMemo } from 'react';
import { collection, doc, updateDoc, deleteDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chapter, Annotation } from '../types';
import { cn } from '../lib/utils';
import { 
  Trash2, 
  Check, 
  X, 
  ArrowUpDown, 
  Filter,
  MessageSquare,
  Calendar,
  BookOpen,
  User,
  AlertCircle,
  Move,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

type SortField = 'date' | 'status' | 'author' | 'chapter';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface FlatAnnotation {
  id: string;
  annotation: Annotation;
  chapterId: string;
  chapterTitle: string;
  chapterYear: string;
  parentId?: string;
  depth: number;
  path: string[];
}

interface AnnotationManagerProps {
  chapters: Chapter[];
}

export default function AnnotationManager({ chapters }: AnnotationManagerProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [moveTargetChapter, setMoveTargetChapter] = useState<string | null>(null);

  // Flatten all annotations from all chapters
  const allAnnotations = useMemo(() => {
    const flat: FlatAnnotation[] = [];
    
    chapters.forEach(chapter => {
      const flatten = (anns: Annotation[], parentId?: string, depth = 0, path: string[] = []) => {
        anns.forEach((ann, index) => {
          const currentPath = [...path, `${depth}-${index}`];
          flat.push({
            id: ann.id,
            annotation: ann,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            chapterYear: chapter.year,
            parentId,
            depth,
            path: currentPath
          });
          if (ann.replies && ann.replies.length > 0) {
            flatten(ann.replies, ann.id, depth + 1, currentPath);
          }
        });
      };
      
      if (chapter.annotations) {
        flatten(chapter.annotations);
      }
    });
    
    return flat;
  }, [chapters]);

  // Filter and sort annotations
  const filteredAnnotations = useMemo(() => {
    let filtered = allAnnotations;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.annotation.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.annotation.content.toLowerCase().includes(query) ||
        a.annotation.author.toLowerCase().includes(query) ||
        a.chapterTitle.toLowerCase().includes(query)
      );
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.annotation.timestamp).getTime() - new Date(b.annotation.timestamp).getTime();
          break;
        case 'status':
          comparison = a.annotation.status.localeCompare(b.annotation.status);
          break;
        case 'author':
          comparison = a.annotation.author.localeCompare(b.annotation.author);
          break;
        case 'chapter':
          comparison = a.chapterTitle.localeCompare(b.chapterTitle);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [allAnnotations, sortField, sortOrder, statusFilter, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleStatusChange = async (flatAnn: FlatAnnotation, newStatus: 'approved' | 'rejected' | 'pending') => {
    const chapter = chapters.find(c => c.id === flatAnn.chapterId);
    if (!chapter) return;

    const updateStatus = (anns: Annotation[]): Annotation[] => {
      return anns.map(a => {
        if (a.id === flatAnn.id) {
          return { ...a, status: newStatus };
        }
        if (a.replies) {
          return { ...a, replies: updateStatus(a.replies) };
        }
        return a;
      });
    };

    const newAnnotations = updateStatus(chapter.annotations || []);
    
    try {
      await updateDoc(doc(db, 'chapters', flatAnn.chapterId), { annotations: newAnnotations });
    } catch (e) {
      console.error('Failed to update status:', e);
      alert('Failed to update annotation status.');
    }
  };

  const handleDelete = async (flatAnn: FlatAnnotation) => {
    if (!confirm('Are you sure you want to delete this annotation?')) return;
    
    const chapter = chapters.find(c => c.id === flatAnn.chapterId);
    if (!chapter) return;

    const removeAnnotation = (anns: Annotation[]): Annotation[] => {
      return anns.filter(a => a.id !== flatAnn.id).map(a => {
        if (a.replies) {
          return { ...a, replies: removeAnnotation(a.replies) };
        }
        return a;
      });
    };

    const newAnnotations = removeAnnotation(chapter.annotations || []);
    
    try {
      await updateDoc(doc(db, 'chapters', flatAnn.chapterId), { annotations: newAnnotations });
    } catch (e) {
      console.error('Failed to delete:', e);
      alert('Failed to delete annotation.');
    }
  };

  const handleMove = async (flatAnn: FlatAnnotation, targetChapterId: string) => {
    if (targetChapterId === flatAnn.chapterId) return;
    
    const sourceChapter = chapters.find(c => c.id === flatAnn.chapterId);
    const targetChapter = chapters.find(c => c.id === targetChapterId);
    if (!sourceChapter || !targetChapter) return;

    // Remove from source
    const removeFromSource = (anns: Annotation[]): Annotation[] => {
      return anns.filter(a => a.id !== flatAnn.id).map(a => {
        if (a.replies) {
          return { ...a, replies: removeFromSource(a.replies) };
        }
        return a;
      });
    };

    // Add to target
    const annotationToMove: Annotation = {
      ...flatAnn.annotation,
      id: Math.random().toString(36).substr(2, 9), // New ID to avoid conflicts
      timestamp: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'chapters', flatAnn.chapterId), { 
        annotations: removeFromSource(sourceChapter.annotations || []) 
      });
      await updateDoc(doc(db, 'chapters', targetChapterId), { 
        annotations: [...(targetChapter.annotations || []), annotationToMove] 
      });
      setMoveTargetChapter(null);
    } catch (e) {
      console.error('Failed to move:', e);
      alert('Failed to move annotation.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedAnnotations.size} annotations?`)) return;
    
    // Process each selected annotation
    for (const annId of selectedAnnotations) {
      const flatAnn = allAnnotations.find(a => a.id === annId);
      if (flatAnn) await handleDelete(flatAnn);
    }
    setSelectedAnnotations(new Set());
    setIsBulkMode(false);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedAnnotations);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAnnotations(newSet);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold text-on-surface">All Annotations</h1>
            <p className="text-outline font-label mt-1">
              {allAnnotations.length} total • {filteredAnnotations.length} shown
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isBulkMode ? (
              <>
                <span className="text-sm font-label text-outline">
                  {selectedAnnotations.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md font-label text-sm hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
                <button
                  onClick={() => { setIsBulkMode(false); setSelectedAnnotations(new Set()); }}
                  className="px-4 py-2 text-outline font-label text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsBulkMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-md font-label text-sm hover:bg-surface-container-high"
              >
                <Filter className="w-4 h-4" />
                Bulk Actions
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-outline-variant p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="text"
                  placeholder="Search annotations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-md font-label text-sm"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-outline" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-outline-variant rounded-md font-label text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sort Headers */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-container-low rounded-t-lg font-label text-xs uppercase tracking-wider text-outline">
          {isBulkMode && <div className="w-8"></div>}
          <button 
            onClick={() => handleSort('chapter')}
            className="col-span-3 flex items-center gap-1 hover:text-on-surface"
          >
            <BookOpen className="w-3 h-3" />
            Chapter
            {sortField === 'chapter' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button 
            onClick={() => handleSort('author')}
            className="col-span-2 flex items-center gap-1 hover:text-on-surface"
          >
            <User className="w-3 h-3" />
            Author
            {sortField === 'author' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button 
            onClick={() => handleSort('date')}
            className="col-span-2 flex items-center gap-1 hover:text-on-surface"
          >
            <Calendar className="w-3 h-3" />
            Date
            {sortField === 'date' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button 
            onClick={() => handleSort('status')}
            className="col-span-2 flex items-center gap-1 hover:text-on-surface"
          >
            <AlertCircle className="w-3 h-3" />
            Status
            {sortField === 'status' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <div className="col-span-2">Actions</div>
        </div>

        {/* Annotations List */}
        <div className="bg-white rounded-b-xl border border-t-0 border-outline-variant overflow-hidden">
          {filteredAnnotations.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-outline/50 mx-auto mb-4" />
              <p className="text-outline font-label">No annotations found.</p>
            </div>
          ) : (
            filteredAnnotations.map((flatAnn) => (
              <div 
                key={flatAnn.id}
                className={cn(
                  "border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low/50 transition-colors",
                  expandedId === flatAnn.id && "bg-surface-container-low"
                )}
              >
                <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
                  {isBulkMode && (
                    <div className="w-8">
                      <input
                        type="checkbox"
                        checked={selectedAnnotations.has(flatAnn.id)}
                        onChange={() => toggleSelection(flatAnn.id)}
                        className="w-4 h-4 rounded border-outline-variant"
                      />
                    </div>
                  )}
                  
                  {/* Chapter */}
                  <div className="col-span-3">
                    <p className="font-label font-medium text-on-surface text-sm">{flatAnn.chapterTitle}</p>
                    <p className="text-xs text-outline">{flatAnn.chapterYear}</p>
                    {flatAnn.depth > 0 && (
                      <p className="text-xs text-tertiary mt-1">Reply (depth {flatAnn.depth})</p>
                    )}
                  </div>
                  
                  {/* Author */}
                  <div className="col-span-2">
                    <p className="font-label text-sm text-on-surface">{flatAnn.annotation.author}</p>
                  </div>
                  
                  {/* Date */}
                  <div className="col-span-2">
                    <p className="font-label text-xs text-outline">
                      {new Date(flatAnn.annotation.timestamp).toLocaleDateString()}
                    </p>
                    <p className="font-label text-xs text-outline">
                      {new Date(flatAnn.annotation.timestamp).toLocaleTimeString()}
                    </p>
                    {flatAnn.annotation.historicalDate && (
                      <p className="text-xs text-primary mt-1">{flatAnn.annotation.historicalDate}</p>
                    )}
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-2">
                    <select
                      value={flatAnn.annotation.status}
                      onChange={(e) => handleStatusChange(flatAnn, e.target.value as any)}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-label border-0 cursor-pointer",
                        getStatusColor(flatAnn.annotation.status)
                      )}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-1">
                    <button
                      onClick={() => setExpandedId(expandedId === flatAnn.id ? null : flatAnn.id)}
                      className="p-2 text-outline hover:text-primary rounded-md"
                      title="View content"
                    >
                      {expandedId === flatAnn.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setMoveTargetChapter(moveTargetChapter === flatAnn.id ? null : flatAnn.id)}
                      className="p-2 text-outline hover:text-primary rounded-md"
                      title="Move to chapter"
                    >
                      <Move className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(flatAnn)}
                      className="p-2 text-outline hover:text-red-600 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Expanded Content */}
                {expandedId === flatAnn.id && (
                  <div className="px-4 pb-4 pl-16">
                    <div className="bg-surface-container-low rounded-lg p-4">
                      <p className="text-on-surface font-body text-sm whitespace-pre-wrap">
                        {flatAnn.annotation.content}
                      </p>
                      {flatAnn.annotation.targetId && (
                        <p className="text-xs text-outline mt-2">
                          Target: {flatAnn.annotation.targetId}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Move Dialog */}
                {moveTargetChapter === flatAnn.id && (
                  <div className="px-4 pb-4 pl-16">
                    <div className="bg-surface-container rounded-lg p-4">
                      <p className="text-sm font-label text-on-surface mb-2">Move to chapter:</p>
                      <div className="flex flex-wrap gap-2">
                        {chapters
                          .filter(c => c.id !== flatAnn.chapterId)
                          .map(chapter => (
                            <button
                              key={chapter.id}
                              onClick={() => handleMove(flatAnn, chapter.id)}
                              className="px-3 py-1 bg-white border border-outline-variant rounded-md text-sm font-label hover:border-primary"
                            >
                              {chapter.title}
                            </button>
                          ))}
                      </div>
                      <button
                        onClick={() => setMoveTargetChapter(null)}
                        className="mt-2 text-xs text-outline font-label"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
