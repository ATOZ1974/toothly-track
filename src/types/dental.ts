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
}

export interface FileCategories {
  personal: UploadedFile[];
  diagnostics: UploadedFile[];
  treatment: UploadedFile[];
  xrays: UploadedFile[];
}

export interface PatientRecord {
  id: string;
  savedAt: string;
  patient: PatientInfo;
  teeth: ToothState;
  treatments: Treatment[];
  notes: ClinicalNotes;
  files: FileCategories;
}

export type ToothStatus = 'healthy' | 'problem' | 'treated' | 'missing';
export type FileCategory = 'personal' | 'diagnostics' | 'treatment' | 'xrays';