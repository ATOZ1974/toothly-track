import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, FileDown, Trash2, FolderOpen, Eye, RefreshCw } from 'lucide-react';
import type { PatientRecord } from '@/types/dental';

interface PatientRecordsProps {
  patients: PatientRecord[];
  loading: boolean;
  onLoadPatient: (record: PatientRecord) => void;
  onDeletePatient: (patientId: string) => Promise<void>;
}

export function PatientRecords({ patients, loading, onLoadPatient, onDeletePatient }: PatientRecordsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<PatientRecord[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecords(patients);
    } else {
      const filtered = patients.filter(record => 
        record.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.patient.phone && record.patient.phone.includes(searchQuery)) ||
        (record.patient.email && record.patient.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRecords(filtered);
    }
  }, [patients, searchQuery]);

  const handleDeleteRecord = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this patient record? This action cannot be undone.');
    
    if (confirmDelete) {
      setDeleting(id);
      try {
        await onDeletePatient(id);
        toast({
          title: "Record Deleted",
          description: "Patient record has been permanently deleted.",
        });
      } catch (error) {
        toast({
          title: "Delete Error",
          description: "Failed to delete patient record. Please try again.",
          variant: "destructive"
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  const exportRecord = async (record: PatientRecord) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const safeName = record.patient.name.replace(/\s+/g, '_');

      const ensureSpace = (needed: number) => {
        const y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 0;
        // We use current y position variable instead
      };

      // Professional Header with Practice Name
      doc.setFillColor(41, 128, 185); // Professional blue
      doc.rect(0, 0, 210, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('DENTAL PATIENT RECORD', 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      let yPos = 45;

      // Patient Information Section with Box
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, 196, yPos); // Top line
      
      yPos += 5;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('PATIENT INFORMATION', 14, yPos);
      yPos += 2;
      doc.line(14, yPos, 196, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Two column layout for patient info
      doc.setFont(undefined, 'bold');
      doc.text('Name:', 14, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(record.patient.name || 'N/A', 40, yPos);
      
      doc.setFont(undefined, 'bold');
      doc.text('Age:', 120, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(String(record.patient.age ?? 'N/A'), 135, yPos);
      yPos += 7;
      
      doc.setFont(undefined, 'bold');
      doc.text('Date of Birth:', 14, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(record.patient.dob || 'N/A', 40, yPos);
      yPos += 7;
      
      doc.setFont(undefined, 'bold');
      doc.text('Phone:', 14, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(record.patient.phone || 'N/A', 40, yPos);
      yPos += 7;
      
      doc.setFont(undefined, 'bold');
      doc.text('Email:', 14, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(record.patient.email || 'N/A', 40, yPos);
      yPos += 15;

      // Dental Status Summary Section
      const statusCounts = getStatusCounts(record);
      doc.setDrawColor(41, 128, 185);
      doc.line(14, yPos, 196, yPos);
      yPos += 5;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('DENTAL STATUS OVERVIEW', 14, yPos);
      yPos += 2;
      doc.line(14, yPos, 196, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      // Status boxes
      const boxWidth = 44;
      const boxHeight = 20;
      const startX = 14;
      const gap = 2;
      
      // Healthy
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(startX, yPos, boxWidth, boxHeight, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text('HEALTHY', startX + boxWidth/2, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.text(String(statusCounts.healthy), startX + boxWidth/2, yPos + 16, { align: 'center' });
      
      // Problem
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(startX + boxWidth + gap, yPos, boxWidth, boxHeight, 2, 2, 'F');
      doc.setFontSize(11);
      doc.text('PROBLEM', startX + boxWidth + gap + boxWidth/2, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.text(String(statusCounts.problem), startX + boxWidth + gap + boxWidth/2, yPos + 16, { align: 'center' });
      
      // Treated
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(startX + (boxWidth + gap) * 2, yPos, boxWidth, boxHeight, 2, 2, 'F');
      doc.setFontSize(11);
      doc.text('TREATED', startX + (boxWidth + gap) * 2 + boxWidth/2, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.text(String(statusCounts.treated), startX + (boxWidth + gap) * 2 + boxWidth/2, yPos + 16, { align: 'center' });
      
      // Missing
      doc.setFillColor(107, 114, 128);
      doc.roundedRect(startX + (boxWidth + gap) * 3, yPos, boxWidth, boxHeight, 2, 2, 'F');
      doc.setFontSize(11);
      doc.text('MISSING', startX + (boxWidth + gap) * 3 + boxWidth/2, yPos + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.text(String(statusCounts.missing), startX + (boxWidth + gap) * 3 + boxWidth/2, yPos + 16, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      yPos += boxHeight + 15;

      // Clinical Notes & History Section
      if (record.notes.chiefComplaint || record.notes.clinicalNotes || record.notes.treatmentNotes) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setDrawColor(41, 128, 185);
        doc.line(14, yPos, 196, yPos);
        yPos += 5;
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('CLINICAL NOTES & HISTORY', 14, yPos);
        yPos += 2;
        doc.line(14, yPos, 196, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        if (record.notes.chiefComplaint) {
          doc.setFillColor(245, 245, 245);
          const complaintLines = doc.splitTextToSize(record.notes.chiefComplaint, 175);
          const boxHeight = (complaintLines.length * 5) + 10;
          doc.roundedRect(14, yPos, 182, boxHeight, 2, 2, 'F');
          
          doc.setFont(undefined, 'bold');
          doc.text('Chief Complaint:', 18, yPos + 6);
          doc.setFont(undefined, 'normal');
          doc.text(complaintLines, 18, yPos + 12);
          yPos += boxHeight + 5;
        }

        if (record.notes.clinicalNotes) {
          if (yPos > 250) { doc.addPage(); yPos = 20; }
          doc.setFillColor(245, 245, 245);
          const clinicalLines = doc.splitTextToSize(record.notes.clinicalNotes, 175);
          const boxHeight = (clinicalLines.length * 5) + 10;
          doc.roundedRect(14, yPos, 182, boxHeight, 2, 2, 'F');
          
          doc.setFont(undefined, 'bold');
          doc.text('Clinical Notes:', 18, yPos + 6);
          doc.setFont(undefined, 'normal');
          doc.text(clinicalLines, 18, yPos + 12);
          yPos += boxHeight + 5;
        }

        if (record.notes.treatmentNotes) {
          if (yPos > 250) { doc.addPage(); yPos = 20; }
          doc.setFillColor(245, 245, 245);
          const treatmentLines = doc.splitTextToSize(record.notes.treatmentNotes, 175);
          const boxHeight = (treatmentLines.length * 5) + 10;
          doc.roundedRect(14, yPos, 182, boxHeight, 2, 2, 'F');
          
          doc.setFont(undefined, 'bold');
          doc.text('Treatment Notes:', 18, yPos + 6);
          doc.setFont(undefined, 'normal');
          doc.text(treatmentLines, 18, yPos + 12);
          yPos += boxHeight + 5;
        }
        
        yPos += 10;
      }

      // Treatments Section with Status
      if (record.treatments && record.treatments.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setDrawColor(41, 128, 185);
        doc.line(14, yPos, 196, yPos);
        yPos += 5;
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('TREATMENT DETAILS', 14, yPos);
        yPos += 2;
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        doc.setTextColor(0, 0, 0);
        
        // Separate completed and planned treatments
        const completedTreatments = record.treatments.filter(t => t.status === 'completed');
        const plannedTreatments = record.treatments.filter(t => t.status !== 'completed');
        
        // Completed Treatments
        if (completedTreatments.length > 0) {
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(34, 197, 94);
          doc.text('✓ Completed Treatments', 14, yPos);
          yPos += 8;
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          completedTreatments.forEach((treatment, index) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            
            doc.setFillColor(240, 253, 244);
            doc.roundedRect(14, yPos - 4, 182, 10, 1, 1, 'F');
            
            doc.setFont(undefined, 'bold');
            const treatmentText = `${index + 1}. ${treatment.name}`;
            doc.text(treatmentText, 18, yPos + 2);
            
            doc.setFont(undefined, 'normal');
            if (treatment.tooth) {
              doc.text(`Tooth #${treatment.tooth}`, 120, yPos + 2);
            }
            if (treatment.cost) {
              doc.text(`RS ${Number(treatment.cost).toFixed(2)}`, 160, yPos + 2);
            }
            
            yPos += 12;
          });
          yPos += 5;
        }
        
        // Planned Treatments
        if (plannedTreatments.length > 0) {
          if (yPos > 250) { doc.addPage(); yPos = 20; }
          
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(234, 179, 8);
          doc.text('⏳ Planned Treatments', 14, yPos);
          yPos += 8;
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          plannedTreatments.forEach((treatment, index) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            
            doc.setFillColor(254, 252, 232);
            doc.roundedRect(14, yPos - 4, 182, 10, 1, 1, 'F');
            
            doc.setFont(undefined, 'bold');
            const treatmentText = `${index + 1}. ${treatment.name}`;
            doc.text(treatmentText, 18, yPos + 2);
            
            doc.setFont(undefined, 'normal');
            if (treatment.tooth) {
              doc.text(`Tooth #${treatment.tooth}`, 120, yPos + 2);
            }
            if (treatment.cost) {
              doc.text(`RS ${Number(treatment.cost).toFixed(2)}`, 160, yPos + 2);
            }
            
            yPos += 12;
          });
          yPos += 5;
        }
        
        yPos += 10;
      }

      // Payments Section
      if (record.payments && record.payments.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setDrawColor(41, 128, 185);
        doc.line(14, yPos, 196, yPos);
        yPos += 5;
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text('PAYMENT HISTORY', 14, yPos);
        yPos += 2;
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        let total = 0;
        record.payments.forEach((p, idx) => {
          if (yPos > 270) { doc.addPage(); yPos = 20; }
          
          // Alternating row colors
          if (idx % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(14, yPos - 4, 182, 10, 'F');
          }
          
          doc.setFont(undefined, 'normal');
          doc.text(`${idx + 1}.`, 18, yPos + 2);
          doc.text(formatDate(p.paidAt), 25, yPos + 2);
          doc.text(p.method.toUpperCase(), 90, yPos + 2);
          
          doc.setFont(undefined, 'bold');
          doc.text(`RS ${p.amount.toFixed(2)}`, 140, yPos + 2);
          
          if (p.notes) {
            doc.setFont(undefined, 'italic');
            doc.setFontSize(8);
            doc.text(p.notes.substring(0, 40), 25, yPos + 7);
            doc.setFontSize(10);
          }
          
          yPos += 12;
          total += p.amount;
        });
        
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        
        // Total with highlight
        doc.setFillColor(41, 128, 185);
        doc.roundedRect(14, yPos, 182, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL PAID: RS ${total.toFixed(2)}`, 105, yPos + 8, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 20;
      }

      // Files & Images
      const categories = Object.keys(record.files || {}) as Array<keyof typeof record.files>;
      const pretty = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

      categories.forEach((catKey) => {
        const categoryFiles = (record.files as any)[catKey] as Array<{ name: string; dataUrl: string; type: string; uploadedAt?: string }>;
        if (!categoryFiles || categoryFiles.length === 0) return;

        const images = categoryFiles.filter((f) => f.type?.startsWith('image/') && f.dataUrl);
        const others = categoryFiles.filter((f) => !f.type?.startsWith('image/'));

        if (images.length > 0) {
          if (yPos > 260) { doc.addPage(); yPos = 20; }
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text(`${pretty(String(catKey))} Images`, 14, yPos);
          yPos += 8;

          const imgW = 60; const imgH = 45; const gap = 6; const cols = 3; const left = 14;
          images.forEach((file, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            if (col === 0 && row > 0) {
              if (yPos + imgH + 14 > 280) { doc.addPage(); yPos = 20; }
            }
            const x = left + col * (imgW + gap);
            const format = file.type?.includes('png') ? 'PNG' : 'JPEG';
            try {
              // For PDF generation, we need to ensure the image URL is accessible
              // Use the public URL directly since the bucket is now public
              doc.addImage(file.dataUrl, format as any, x, yPos, imgW, imgH);
              doc.setFontSize(8);
              doc.setFont(undefined, 'normal');
              const caption = `${file.name}${file.uploadedAt ? ` • ${formatDate(file.uploadedAt)}` : ''}`;
              doc.text(doc.splitTextToSize(caption, imgW), x, yPos + imgH + 4);
            } catch (error) {
              // If image fails to load, add a placeholder
              doc.setFontSize(8);
              doc.text(`[Image: ${file.name}]`, x, yPos + imgH/2);
            }
            if (col === cols - 1 || idx === images.length - 1) {
              yPos += imgH + 14;
            }
          });
        }

        if (others.length > 0) {
          if (yPos > 270) { doc.addPage(); yPos = 20; }
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(`${pretty(String(catKey))} Documents`, 14, yPos);
          yPos += 8;
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          others.forEach((f) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.text(`• ${f.name}`, 14, yPos);
            yPos += 6;
          });
          yPos += 4;
        }
      });

      // Professional Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 285, 210, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`Page ${i} of ${pageCount}`, 14, 291);
        doc.text(`Record ID: ${record.id.substring(0, 8)}`, 105, 291, { align: 'center' });
        doc.text(`Saved: ${formatDate(record.savedAt)}`, 196, 291, { align: 'right' });
      }

      // Save PDF
      doc.save(`${safeName}_dental_record.pdf`);

      toast({
        title: 'Export Complete',
        description: `Patient record for ${record.patient.name} has been exported as PDF.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCounts = (record: PatientRecord) => {
    const teeth = Object.values(record.teeth);
    return {
      healthy: teeth.filter(status => status === 'healthy').length,
      problem: teeth.filter(status => status === 'problem').length,
      treated: teeth.filter(status => status === 'treated').length,
      missing: teeth.filter(status => status === 'missing').length,
    };
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl text-foreground">Patient Records</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button variant="outline" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50 animate-spin" />
            <p className="text-lg">Loading patient records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {patients.length === 0 ? (
              <div className="space-y-2">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg">No patient records found</p>
                <p className="text-sm">Save your first patient record to see it here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg">No records match your search</p>
                <p className="text-sm">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const statusCounts = getStatusCounts(record);
              
              return (
                <Card key={record.id} className="border-border hover:border-primary/30 transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {record.patient.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                              <span>Age: {record.patient.age || 'N/A'}</span>
                              <span>•</span>
                              <span>Phone: {record.patient.phone || 'N/A'}</span>
                              {record.patient.email && (
                                <>
                                  <span>•</span>
                                  <span>{record.patient.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(record.savedAt)}
                          </Badge>
                        </div>

                        {/* Status Summary */}
                        <div className="flex flex-wrap gap-2">
                          {statusCounts.healthy > 0 && (
                            <Badge className="bg-tooth-healthy text-white text-xs">
                              {statusCounts.healthy} Healthy
                            </Badge>
                          )}
                          {statusCounts.problem > 0 && (
                            <Badge className="bg-tooth-problem text-white text-xs">
                              {statusCounts.problem} Problem
                            </Badge>
                          )}
                          {statusCounts.treated > 0 && (
                            <Badge className="bg-tooth-treated text-white text-xs">
                              {statusCounts.treated} Treated
                            </Badge>
                          )}
                          {statusCounts.missing > 0 && (
                            <Badge className="bg-tooth-missing text-white text-xs">
                              {statusCounts.missing} Missing
                            </Badge>
                          )}
                          {record.treatments.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {record.treatments.length} Treatment{record.treatments.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        {/* Chief Complaint Preview */}
                        {record.notes.chiefComplaint && (
                          <div className="text-sm">
                            <span className="font-medium text-foreground">Chief Complaint: </span>
                            <span className="text-muted-foreground">
                              {record.notes.chiefComplaint.length > 100 
                                ? `${record.notes.chiefComplaint.slice(0, 100)}...`
                                : record.notes.chiefComplaint
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-4">
                        <Button
                          size="sm"
                          onClick={() => onLoadPatient(record)}
                          className="flex-1 lg:flex-none bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportRecord(record)}
                          className="flex-1 lg:flex-none"
                        >
                          <FileDown className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRecord(record.id)}
                          disabled={deleting === record.id}
                          className="flex-1 lg:flex-none"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {deleting === record.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {patients.length > 0 && !loading && (
          <div className="text-sm text-muted-foreground text-center pt-4 border-t">
            Showing {filteredRecords.length} of {patients.length} patient record{patients.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}