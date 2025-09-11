import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Link2, Unlink } from 'lucide-react';
import type { Treatment, ToothState } from '@/types/dental';

interface TreatmentPlanningProps {
  treatments: Treatment[];
  selectedTooth: number | null;
  toothStates: ToothState;
  onTreatmentsChange: (treatments: Treatment[]) => void;
}

const basicTreatments = [
  { name: 'Cleaning', icon: '🧽' },
  { name: 'Filling', icon: '🦷' },
  { name: 'Extraction', icon: '🔧' },
  { name: 'Fluoride Treatment', icon: '💧' },
  { name: 'Scaling', icon: '🪥' },
  { name: 'Polishing', icon: '✨' },
  { name: 'X-Ray', icon: '📸' },
  { name: 'Consultation', icon: '💬' },
];

const advancedTreatments = [
  { name: 'Root Canal', icon: '🔴' },
  { name: 'Crown', icon: '👑' },
  { name: 'Bridge', icon: '🌉' },
  { name: 'Implant', icon: '🔩' },
  { name: 'Veneer', icon: '💎' },
  { name: 'Orthodontics', icon: '🦷' },
  { name: 'Periodontal Surgery', icon: '🔪' },
  { name: 'Whitening', icon: '⚡' },
];

export function TreatmentPlanning({ 
  treatments, 
  selectedTooth, 
  toothStates, 
  onTreatmentsChange 
}: TreatmentPlanningProps) {
  const generateId = () => `treatment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addTreatment = (name: string, category: 'basic' | 'advanced') => {
    const newTreatment: Treatment = {
      id: generateId(),
      name,
      tooth: selectedTooth,
      category,
    };
    
    onTreatmentsChange([...treatments, newTreatment]);
  };

  const removeTreatment = (id: string) => {
    onTreatmentsChange(treatments.filter(t => t.id !== id));
  };

  const attachToothToTreatment = (id: string) => {
    if (selectedTooth === null) return;
    
    onTreatmentsChange(
      treatments.map(t => 
        t.id === id ? { ...t, tooth: selectedTooth } : t
      )
    );
  };

  const detachToothFromTreatment = (id: string) => {
    onTreatmentsChange(
      treatments.map(t => 
        t.id === id ? { ...t, tooth: null } : t
      )
    );
  };

  const getToothStatusBadge = (toothNumber: number | null | undefined) => {
    if (!toothNumber) return null;
    
    const status = toothStates[toothNumber] || 'healthy';
    const colors = {
      healthy: 'bg-tooth-healthy',
      problem: 'bg-tooth-problem', 
      treated: 'bg-tooth-treated',
      missing: 'bg-tooth-missing',
    };

    return (
      <Badge className={`${colors[status]} text-white text-xs`}>
        Tooth {toothNumber} • {status}
      </Badge>
    );
  };

  const TreatmentGrid = ({ treatments: treatmentList, title, category }: { 
    treatments: typeof basicTreatments, 
    title: string,
    category: 'basic' | 'advanced'
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {treatmentList.map((treatment) => (
          <Button
            key={treatment.name}
            onClick={() => addTreatment(treatment.name, category)}
            variant="outline"
            className="p-4 h-auto flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
          >
            <span className="text-2xl">{treatment.icon}</span>
            <span className="text-sm font-medium">{treatment.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Treatment Planning</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Basic Treatments */}
        <TreatmentGrid 
          treatments={basicTreatments} 
          title="Basic Treatments"
          category="basic"
        />

        {/* Advanced Treatments */}
        <TreatmentGrid 
          treatments={advancedTreatments} 
          title="Advanced Treatments"
          category="advanced"
        />

        {/* Treatment List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Planned Treatments</h3>
          
          {treatments.length === 0 ? (
            <div className="text-center p-8 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                No treatments planned yet. Click on treatment options above to add them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <Card key={treatment.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-foreground">{treatment.name}</span>
                      {treatment.tooth ? (
                        getToothStatusBadge(treatment.tooth)
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          No tooth linked
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {treatment.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedTooth && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => attachToothToTreatment(treatment.id)}
                          className="text-xs"
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Attach Tooth {selectedTooth}
                        </Button>
                      )}
                      
                      {treatment.tooth && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => detachToothFromTreatment(treatment.id)}
                          className="text-xs"
                        >
                          <Unlink className="w-3 h-3 mr-1" />
                          Detach
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeTreatment(treatment.id)}
                        className="text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}