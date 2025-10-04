export interface PatientInfo {
  name: string;
  age: number | null;
  dob: string;
  phone: string;
  email: string;
}

export interface Treatment {
  id: string;
  name: string;
  tooth?: number | null;
  category: 'basic' | 'advanced';
  status?: 'planned' | 'completed';
  cost?: number | null;
}

export interface ToothState {
  [toothNumber: number]: 'healthy' | 'problem' | 'treated' | 'missing';
}

export interface ClinicalNotes {
  chiefComplaint: string;
  clinicalNotes: string;
  treatmentNotes: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt?: string;
}

export interface FileCategories {
  personal: UploadedFile[];
  diagnostics: UploadedFile[];
  treatment: UploadedFile[];
  xrays: UploadedFile[];
}

export interface Payment {
  id: string;
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'insurance' | 'other';
  paidAt: string; // ISO datetime
  notes?: string;
}

export interface PatientRecord {
  id: string;
  savedAt: string;
  patient: PatientInfo;
  teeth: ToothState;
  treatments: Treatment[];
  notes: ClinicalNotes;
  files: FileCategories;
  payments?: Payment[];
}

export type ToothStatus = 'healthy' | 'problem' | 'treated' | 'missing';
export type FileCategory = 'personal' | 'diagnostics' | 'treatment' | 'xrays';