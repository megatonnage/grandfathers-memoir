export type Era = 'ancient' | 'past' | 'present' | 'future' | 'end-of-time';

export interface Annotation {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  era: Era;
  targetId?: string; // ID of the paragraph or line being annotated
  historicalDate?: string; // String for arbitrary Month/Year parsing down the road (e.g. 'April 1975')
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
}

export interface SpeculativeResponse {
  id: string;
  author: string;
  era: Era;
  content: string;
  targetChapterId: string;
}
