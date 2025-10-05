import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PatientInfo } from '@/types/dental';
interface PatientFormProps {
  patientInfo: PatientInfo;
  onPatientInfoChange: (info: PatientInfo) => void;
}
export function PatientForm({
  patientInfo,
  onPatientInfoChange
}: PatientFormProps) {
  const updateField = (field: keyof PatientInfo, value: string | number | null) => {
    onPatientInfoChange({
      ...patientInfo,
      [field]: value
    });
  };
  return <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-foreground text-3xl">Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="patientName" className="text-sm font-medium">Patient Name *</Label>
            <Input id="patientName" value={patientInfo.name} onChange={e => updateField('name', e.target.value)} placeholder="Enter patient name" className="mt-2" />
          </div>
          
          <div>
            <Label htmlFor="patientAge" className="text-sm font-medium">Age *</Label>
            <Input id="patientAge" type="number" value={patientInfo.age || ''} onChange={e => updateField('age', e.target.value ? parseInt(e.target.value) : null)} placeholder="Enter age" min="0" max="120" className="mt-2" />
          </div>
          
          <div>
            <Label htmlFor="patientDOB" className="text-sm font-medium">Date of Birth</Label>
            <Input id="patientDOB" type="date" value={patientInfo.dob} onChange={e => {
            const dob = e.target.value;
            let computedAge: number | null = null;
            if (dob) {
              const d = new Date(dob);
              if (!isNaN(d.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - d.getFullYear();
                const m = today.getMonth() - d.getMonth();
                if (m < 0 || m === 0 && today.getDate() < d.getDate()) age--;
                computedAge = age >= 0 && age <= 120 ? age : null;
              }
            }
            onPatientInfoChange({
              ...patientInfo,
              dob,
              age: computedAge
            });
          }} className="mt-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <Label htmlFor="patientPhone" className="text-sm font-medium">Phone Number *</Label>
            <Input id="patientPhone" type="tel" value={patientInfo.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Enter phone number" className="mt-2" />
          </div>
          
          <div>
            <Label htmlFor="patientEmail" className="text-sm font-medium">Email</Label>
            <Input id="patientEmail" type="email" value={patientInfo.email} onChange={e => updateField('email', e.target.value)} placeholder="Enter email address" className="mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>;
}