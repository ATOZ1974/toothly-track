import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { AnalyticsSummary, RevenueData, PaymentMethodData, TreatmentData } from '@/hooks/useAnalytics';
import { toast } from 'sonner';

interface ReportExportProps {
  summary: AnalyticsSummary;
  revenueData: RevenueData[];
  paymentMethods: PaymentMethodData[];
  topTreatments: TreatmentData[];
  startDate: Date;
  endDate: Date;
  onClose: () => void;
}

export function ReportExport({
  summary,
  revenueData,
  paymentMethods,
  topTreatments,
  startDate,
  endDate,
  onClose,
}: ReportExportProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Revenue Analytics Report', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, 20, yPos);
    yPos += 15;

    // Summary Section
    doc.setFontSize(16);
    doc.text('Summary', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Patients: ${summary.totalPatients}`, 20, yPos);
    yPos += 7;
    doc.text(`Total Treatments: ${summary.totalTreatments}`, 20, yPos);
    yPos += 7;
    doc.text(`Average Treatment Value: $${summary.avgTreatmentValue.toFixed(2)}`, 20, yPos);
    yPos += 15;

    // Payment Methods
    doc.setFontSize(16);
    doc.text('Payment Methods', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    paymentMethods.forEach((method) => {
      doc.text(`${method.method}: $${method.amount.toFixed(2)} (${method.count} transactions)`, 20, yPos);
      yPos += 7;
    });
    yPos += 10;

    // Top Treatments
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Top Treatments', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    topTreatments.slice(0, 10).forEach((treatment) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${treatment.name}: $${treatment.revenue.toFixed(2)} (${treatment.count} treatments)`, 20, yPos);
      yPos += 7;
    });

    // Save PDF
    doc.save(`revenue-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Report exported successfully!');
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Revenue Report</DialogTitle>
          <DialogDescription>
            Generate a PDF report of your practice analytics for the selected period.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Period:</span> {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Revenue:</span> ${summary.totalRevenue.toFixed(2)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Treatments:</span> {summary.totalTreatments}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={generatePDF}>
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
