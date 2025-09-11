import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { ClinicalNotes as NotesType } from '@/types/dental';

interface ClinicalNotesProps {
  notes: NotesType;
  onNotesChange: (notes: NotesType) => void;
}

export function ClinicalNotes({ notes, onNotesChange }: ClinicalNotesProps) {
  const updateField = (field: keyof NotesType, value: string) => {
    onNotesChange({
      ...notes,
      [field]: value,
    });
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Clinical Notes & History</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="chiefComplaint" className="text-sm font-medium">
            Chief Complaint
          </Label>
          <Textarea
            id="chiefComplaint"
            value={notes.chiefComplaint}
            onChange={(e) => updateField('chiefComplaint', e.target.value)}
            placeholder="Patient's main concern or reason for visit..."
            className="mt-2 min-h-[100px]"
          />
        </div>
        
        <div>
          <Label htmlFor="clinicalNotes" className="text-sm font-medium">
            Clinical Notes
          </Label>
          <Textarea
            id="clinicalNotes"
            value={notes.clinicalNotes}
            onChange={(e) => updateField('clinicalNotes', e.target.value)}
            placeholder="Examination findings, observations, and clinical notes..."
            className="mt-2 min-h-[120px]"
          />
        </div>
        
        <div>
          <Label htmlFor="treatmentNotes" className="text-sm font-medium">
            Treatment Notes
          </Label>
          <Textarea
            id="treatmentNotes"
            value={notes.treatmentNotes}
            onChange={(e) => updateField('treatmentNotes', e.target.value)}
            placeholder="Treatment performed, medications prescribed, follow-up instructions..."
            className="mt-2 min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}