import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ToothState, ToothStatus } from '@/types/dental';

interface DentalChartProps {
  selectedTooth: number | null;
  toothStates: ToothState;
  patientAge: number | null;
  onToothSelect: (tooth: number) => void;
  onToothStateChange: (states: ToothState) => void;
}

export function DentalChart({ 
  selectedTooth, 
  toothStates, 
  patientAge, 
  onToothSelect, 
  onToothStateChange 
}: DentalChartProps) {
  const isChild = patientAge !== null && patientAge < 12;
  
  // Adult teeth numbering (FDI)
  const adultUpperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const adultLowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  
  // Primary teeth numbering
  const childUpperTeeth = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
  const childLowerTeeth = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

  const upperTeeth = isChild ? childUpperTeeth : adultUpperTeeth;
  const lowerTeeth = isChild ? childLowerTeeth : adultLowerTeeth;

  const getToothColor = (state: ToothStatus | undefined): string => {
    switch (state) {
      case 'healthy': return 'bg-tooth-healthy hover:bg-tooth-healthy/80';
      case 'problem': return 'bg-tooth-problem hover:bg-tooth-problem/80';
      case 'treated': return 'bg-tooth-treated hover:bg-tooth-treated/80';
      case 'missing': return 'bg-tooth-missing hover:bg-tooth-missing/80';
      default: return 'bg-tooth-healthy hover:bg-tooth-healthy/80';
    }
  };

  const markTooth = (status: ToothStatus) => {
    if (selectedTooth === null) return;
    
    onToothStateChange({
      ...toothStates,
      [selectedTooth]: status,
    });
  };

  const ToothButton = ({ toothNumber }: { toothNumber: number }) => (
    <button
      onClick={() => onToothSelect(toothNumber)}
      className={`
        relative w-12 h-16 rounded-lg border-2 transition-all duration-200 
        ${getToothColor(toothStates[toothNumber])}
        ${selectedTooth === toothNumber 
          ? 'border-destructive shadow-lg scale-110' 
          : 'border-primary/30 hover:border-primary'
        }
        flex items-center justify-center text-white font-bold text-sm
        shadow-[var(--shadow-soft)]
      `}
    >
      {toothNumber}
      {selectedTooth === toothNumber && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
      )}
    </button>
  );

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-foreground">Dental Chart</CardTitle>
          <Badge variant="secondary">
            {isChild ? `Primary Dentition (${upperTeeth.length + lowerTeeth.length} teeth)` 
                     : `Adult Dentition (${upperTeeth.length + lowerTeeth.length} teeth)`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-healthy rounded" />
            <span className="text-sm">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-problem rounded" />
            <span className="text-sm">Needs Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-treated rounded" />
            <span className="text-sm">Treated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-missing rounded" />
            <span className="text-sm">Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-transparent border-2 border-destructive rounded" />
            <span className="text-sm">Selected</span>
          </div>
        </div>

        {/* Dental Chart */}
        <div className="space-y-8">
          {/* Upper Jaw */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Upper Jaw</h3>
            <div className="flex justify-center">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${upperTeeth.length}, minmax(0, 1fr))` }}>
                {upperTeeth.map((tooth) => (
                  <ToothButton key={tooth} toothNumber={tooth} />
                ))}
              </div>
            </div>
          </div>

          {/* Lower Jaw */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Lower Jaw</h3>
            <div className="flex justify-center">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${lowerTeeth.length}, minmax(0, 1fr))` }}>
                {lowerTeeth.map((tooth) => (
                  <ToothButton key={tooth} toothNumber={tooth} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Tooth Actions */}
        {selectedTooth && (
          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="p-4">
              <h3 className="font-semibold text-accent-foreground mb-4">
                Selected Tooth: {selectedTooth}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={() => markTooth('healthy')}
                  className="bg-tooth-healthy hover:bg-tooth-healthy/80 text-white"
                >
                  Mark Healthy
                </Button>
                <Button 
                  onClick={() => markTooth('problem')}
                  className="bg-tooth-problem hover:bg-tooth-problem/80 text-white"
                >
                  Needs Attention
                </Button>
                <Button 
                  onClick={() => markTooth('treated')}
                  className="bg-tooth-treated hover:bg-tooth-treated/80 text-white"
                >
                  Mark Treated
                </Button>
                <Button 
                  onClick={() => markTooth('missing')}
                  className="bg-tooth-missing hover:bg-tooth-missing/80 text-white"
                >
                  Mark Missing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}