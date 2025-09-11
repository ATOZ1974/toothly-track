import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, FileDown, Trash2, FolderOpen, Eye } from 'lucide-react';
import type { PatientRecord } from '@/types/dental';

interface PatientRecordsProps {
  onLoadPatient: (record: PatientRecord) => void;
}

export function PatientRecords({ onLoadPatient }: PatientRecordsProps) {
  const { toast } = useToast();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<PatientRecord[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(record => 
        record.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patient.phone.includes(searchQuery) ||
        record.patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [records, searchQuery]);

  const loadRecords = () => {
    try {
      const savedRecords = JSON.parse(localStorage.getItem('dentalPatients') || '[]');
      setRecords(savedRecords);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient records.",
        variant: "destructive"
      });
    }
  };

  const deleteRecord = (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this patient record? This action cannot be undone.');
    
    if (confirmDelete) {
      const updatedRecords = records.filter(record => record.id !== id);
      setRecords(updatedRecords);
      localStorage.setItem('dentalPatients', JSON.stringify(updatedRecords));
      
      toast({
        title: "Record Deleted",
        description: "Patient record has been permanently deleted.",
      });
    }
  };

  const exportRecord = (record: PatientRecord) => {
    const dataStr = JSON.stringify(record, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${record.patient.name.replace(/\s+/g, '_')}_dental_record.json`;
    link.click();
    
    toast({
      title: "Export Complete",
      description: `Patient record for ${record.patient.name} has been exported.`,
    });
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
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Patient Records</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={loadRecords} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {records.length === 0 ? (
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
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
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
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => onLoadPatient(record)}
                          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportRecord(record)}
                        >
                          <FileDown className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteRecord(record.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
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
        {records.length > 0 && (
          <div className="text-sm text-muted-foreground text-center pt-4 border-t">
            Showing {filteredRecords.length} of {records.length} patient record{records.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}