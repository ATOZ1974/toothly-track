import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PatientForm } from './PatientForm';
import { DentalChart } from './DentalChart';
import { TreatmentPlanning } from './TreatmentPlanning';
import { FileUpload } from './FileUpload';
import { ClinicalNotes } from './ClinicalNotes';
import { PatientRecords } from './PatientRecords';
import { PaymentSection } from './PaymentSection';
import type { PatientRecord, PatientInfo, ToothState, Treatment, ClinicalNotes as NotesType, FileCategories, Payment } from '@/types/dental';

export function DentalManagement() {
  const { toast } = useToast();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: null,
    dob: '',
    phone: '',
    email: '',
  });
  
  const [toothStates, setToothStates] = useState<ToothState>({});
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [notes, setNotes] = useState<NotesType>({
    chiefComplaint: '',
    clinicalNotes: '',
    treatmentNotes: '',
  });
  
  const [files, setFiles] = useState<FileCategories>({
    personal: [],
    diagnostics: [],
    treatment: [],
    xrays: [],
  });

  const [payments, setPayments] = useState<Payment[]>([]);

  const [showRecords, setShowRecords] = useState(false);

  const generateId = () => `dental-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const savePatientRecord = () => {
    if (!patientInfo.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter patient name before saving.",
        variant: "destructive"
      });
      return;
    }

    const record: PatientRecord = {
      id: generateId(),
      savedAt: new Date().toISOString(),
      patient: patientInfo,
      teeth: toothStates,
      treatments,
      notes,
      files,
      payments,
    };

    try {
      const existingRecords = JSON.parse(localStorage.getItem('dentalPatients') || '[]');
      existingRecords.push(record);
      localStorage.setItem('dentalPatients', JSON.stringify(existingRecords));
      
      toast({
        title: "Record Saved",
        description: `Patient record for ${patientInfo.name} has been saved successfully.`,
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
    setPatientInfo({ name: '', age: null, dob: '', phone: '', email: '' });
    setToothStates({});
    setTreatments([]);
    setNotes({ chiefComplaint: '', clinicalNotes: '', treatmentNotes: '' });
    setFiles({ personal: [], diagnostics: [], treatment: [], xrays: [] });
    setPayments([]);
    setSelectedTooth(null);
    
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <Card className="border-0 shadow-[var(--shadow-dental)] bg-gradient-to-r from-card to-muted">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🦷 Dental Patient Management
            </CardTitle>
            <p className="text-muted-foreground text-lg">Comprehensive dental care tracking system</p>
          </CardHeader>
        </Card>

        {/* Patient Information */}
        <PatientForm 
          patientInfo={patientInfo}
          onPatientInfoChange={setPatientInfo}
        />

        {/* Dental Chart */}
        <DentalChart
          selectedTooth={selectedTooth}
          toothStates={toothStates}
          patientAge={patientInfo.age}
          onToothSelect={setSelectedTooth}
          onToothStateChange={setToothStates}
        />

        {/* Treatment Planning */}
        <TreatmentPlanning
          treatments={treatments}
          selectedTooth={selectedTooth}
          toothStates={toothStates}
          onTreatmentsChange={setTreatments}
        />

        {/* File Upload */}
        <FileUpload
          files={files}
          onFilesChange={setFiles}
        />

        {/* Payments */}
        <PaymentSection payments={payments} onChange={setPayments} />

        {/* Clinical Notes */}
        <ClinicalNotes
          notes={notes}
          onNotesChange={setNotes}
        />

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-end">
              <Button variant="outline" onClick={clearForm}>
                Clear Form
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setShowRecords(!showRecords)}
              >
                {showRecords ? 'Hide' : 'Show'} Patient Records
              </Button>
              <Button onClick={savePatientRecord} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                💾 Save Patient Record
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Records */}
        {showRecords && (
          <PatientRecords
            onLoadPatient={(record) => {
              setPatientInfo(record.patient);
              setToothStates(record.teeth);
              setTreatments(record.treatments);
              setNotes(record.notes);
              setFiles(record.files);
              setPayments(record.payments || []);
              setSelectedTooth(null);
              
              toast({
                title: "Patient Loaded",
                description: `Loaded record for ${record.patient.name}`,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}