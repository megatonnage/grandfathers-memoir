export type Era = 'ancient' | 'past' | 'present' | 'future' | 'end-of-time';

export interface Annotation {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  era: Era;
  targetId?: string;
  historicalDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  replies?: Annotation[];
}

export interface Chapter {
  id: string;
  title: string;
  year: string;
  contentVi: string;
  contentEn: string;
  image?: string;
  imageCaption?: string;
  annotations: Annotation[];
  timestamp?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
  uploadedBy: string;
  historicalDate?: string;
  annotations: Annotation[];
}

export interface SpeculativeResponse {
  id: string;
  author: string;
  era: Era;
  content: string;
  targetChapterId: string;
}
