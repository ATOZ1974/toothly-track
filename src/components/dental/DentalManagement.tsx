import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { PatientForm } from './PatientForm';
import { DentalChart } from './DentalChart';
import { DentalChart3D } from './DentalChart3D';
import { TreatmentPlanning } from './TreatmentPlanning';
import { FileUpload } from './FileUpload';
import { ClinicalNotes } from './ClinicalNotes';
import { PatientRecords } from './PatientRecords';
import { PaymentSection } from './PaymentSection';
import { Badge } from '@/components/ui/badge';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import type { PatientRecord, PatientInfo, ToothState, Treatment, ClinicalNotes as NotesType, FileCategories, Payment, ToothStatus } from '@/types/dental';
export function DentalManagement() {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    patients,
    loading,
    savePatient,
    deletePatient
  } = usePatients();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: null,
    dob: '',
    phone: '',
    email: ''
  });
  const [toothStates, setToothStates] = useState<ToothState>({});
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [notes, setNotes] = useState<NotesType>({
    chiefComplaint: '',
    clinicalNotes: '',
    treatmentNotes: ''
  });
  const [files, setFiles] = useState<FileCategories>({
    personal: [],
    diagnostics: [],
    treatment: [],
    xrays: []
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [showRecords, setShowRecords] = useState(false);
  const [use3DChart, setUse3DChart] = useState(false);
  const { isOnline, pendingSync } = useOfflineStorage();
  const savePatientRecord = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save patient records.",
        variant: "destructive"
      });
      return;
    }
    if (!patientInfo.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter patient name before saving.",
        variant: "destructive"
      });
      return;
    }
    try {
      const record = {
        patient: patientInfo,
        teeth: toothStates,
        treatments,
        notes,
        files,
        payments
      };
      const savedId = await savePatient(record, currentRecordId || undefined);
      if (!currentRecordId) {
        setCurrentRecordId(savedId);
      }
      toast({
        title: "Record Saved",
        description: `Patient record for ${patientInfo.name} has been ${currentRecordId ? 'updated' : 'saved'} successfully.`
      });
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save patient record. Please try again.",
        variant: "destructive"
      });
    }
  };
  const clearForm = () => {
    setPatientInfo({
      name: '',
      age: null,
      dob: '',
      phone: '',
      email: ''
    });
    setToothStates({});
    setTreatments([]);
    setNotes({
      chiefComplaint: '',
      clinicalNotes: '',
      treatmentNotes: ''
    });
    setFiles({
      personal: [],
      diagnostics: [],
      treatment: [],
      xrays: []
    });
    setPayments([]);
    setSelectedTooth(null);
    setCurrentRecordId(null);
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared."
    });
  };
  return <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8 relative">
      <div className="container mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="glass-card rounded-2xl text-center p-4 sm:p-6 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text mb-2 text-slate-50 lg:text-5xl">
            🦷 Dental Patient Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Comprehensive dental care tracking system</p>
        </div>

        {/* Offline/Online Status */}
        {!isOnline && (
          <div className="glass-card rounded-2xl p-4 bg-yellow-500/10 border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ You're offline. Changes will be saved locally and synced when connection is restored.
              {pendingSync > 0 && ` (${pendingSync} items pending sync)`}
            </p>
          </div>
        )}

        {/* Patient Information */}
        <PatientForm patientInfo={patientInfo} onPatientInfoChange={setPatientInfo} />

        {/* Dental Chart Toggle */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setUse3DChart(!use3DChart)}
            className="glass-button"
          >
            {use3DChart ? '📊 Switch to 2D Chart' : '🎮 Switch to 3D Chart'}
          </Button>
        </div>

        {/* Dental Chart */}
        {use3DChart ? (
          <DentalChart3D 
            selectedTooth={selectedTooth} 
            toothStates={toothStates} 
            patientAge={patientInfo.age} 
            onToothSelect={setSelectedTooth}
            onToothStateChange={(tooth: number, state: ToothStatus) => {
              setToothStates(prev => ({ ...prev, [tooth]: state }));
            }}
          />
        ) : (
          <DentalChart 
            selectedTooth={selectedTooth} 
            toothStates={toothStates} 
            patientAge={patientInfo.age} 
            onToothSelect={setSelectedTooth} 
            onToothStateChange={setToothStates} 
          />
        )}

        {/* Treatment Planning */}
        <TreatmentPlanning treatments={treatments} selectedTooth={selectedTooth} toothStates={toothStates} onTreatmentsChange={setTreatments} />

        {/* File Upload */}
        <FileUpload files={files} onFilesChange={setFiles} patientId={currentRecordId || undefined} />

        {/* Payments */}
        <PaymentSection payments={payments} onChange={setPayments} />

        {/* Clinical Notes */}
        <ClinicalNotes notes={notes} onNotesChange={setNotes} />

        {/* Action Buttons */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            <Button variant="outline" onClick={clearForm} className="w-full sm:w-auto glass-button">
              Clear Form
            </Button>
            <Button variant="secondary" onClick={() => setShowRecords(!showRecords)} className="w-full sm:w-auto glass-button">
              {showRecords ? 'Hide' : 'Show'} Patient Records
            </Button>
            <Button onClick={savePatientRecord} className="w-full sm:w-auto glass-button bg-gradient-to-r from-primary to-accent hover:opacity-90" disabled={loading}>
              💾 {loading ? 'Saving...' : 'Save Patient Record'}
            </Button>
          </div>
        </div>

        {/* Patient Records */}
        {showRecords && <PatientRecords patients={patients} loading={loading} onLoadPatient={record => {
        console.log('Loading patient record into form:', {
          patient: record.patient,
          teeth: record.teeth,
          treatments: record.treatments,
          notes: record.notes,
          files: record.files,
          payments: record.payments
        });
        
        setPatientInfo(record.patient);
        setToothStates(record.teeth);
        setTreatments(record.treatments);
        setNotes(record.notes);
        setFiles(record.files);
        setPayments(record.payments || []);
        setSelectedTooth(null);
        setCurrentRecordId(record.id);
        setShowRecords(false); // Hide records after loading
        
        // Scroll to top to show loaded data
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        toast({
          title: "Patient Loaded",
          description: `Loaded ${record.patient.name} - ${Object.keys(record.teeth).length} teeth, ${record.treatments.length} treatments, ${record.notes.chiefComplaint ? 'notes' : 'no notes'}`
        });
      }} onDeletePatient={deletePatient} />}
      </div>
    </div>;
}