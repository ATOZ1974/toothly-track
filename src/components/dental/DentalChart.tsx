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
      case 'healthy':
        return 'bg-tooth-healthy hover:bg-tooth-healthy/80';
      case 'problem':
        return 'bg-tooth-problem hover:bg-tooth-problem/80';
      case 'treated':
        return 'bg-tooth-treated hover:bg-tooth-treated/80';
      case 'missing':
        return 'bg-tooth-missing hover:bg-tooth-missing/80';
      default:
        return 'bg-tooth-healthy hover:bg-tooth-healthy/80';
    }
  };
  const markTooth = (status: ToothStatus) => {
    if (selectedTooth === null) return;
    onToothStateChange({
      ...toothStates,
      [selectedTooth]: status
    });
  };
  const ToothButton = ({
    toothNumber
  }: {
    toothNumber: number;
  }) => <button onClick={() => onToothSelect(toothNumber)} className={`
        relative w-8 h-12 sm:w-10 sm:h-14 md:w-12 md:h-16 rounded-lg border-2 transition-all duration-200 
        ${getToothColor(toothStates[toothNumber])}
        ${selectedTooth === toothNumber ? 'border-destructive shadow-lg scale-110' : 'border-primary/30 hover:border-primary active:scale-95'}
        flex items-center justify-center text-white font-bold text-xs sm:text-sm
        shadow-[var(--shadow-soft)] touch-manipulation
        min-h-[44px] min-w-[44px]
      `}>
      <span className="text-xs sm:text-sm">{toothNumber}</span>
      {selectedTooth === toothNumber && <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />}
    </button>;
  return <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-foreground text-3xl">Dental Chart</CardTitle>
          <Badge variant="secondary">
            {isChild ? `Primary Dentition (${upperTeeth.length + lowerTeeth.length} teeth)` : `Adult Dentition (${upperTeeth.length + lowerTeeth.length} teeth)`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-healthy rounded flex-shrink-0" />
            <span className="text-sm">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-problem rounded flex-shrink-0" />
            <span className="text-sm">Problem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-treated rounded flex-shrink-0" />
            <span className="text-sm">Treated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tooth-missing rounded flex-shrink-0" />
            <span className="text-sm">Missing</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-1 lg:col-span-1">
            <div className="w-4 h-4 bg-transparent border-2 border-destructive rounded flex-shrink-0" />
            <span className="text-sm">Selected</span>
          </div>
        </div>

        {/* Dental Chart */}
        <div className="space-y-6">
          {/* Upper Jaw */}
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Upper Jaw</h3>
            <div className="overflow-x-auto pb-2">
              <div className="flex justify-center min-w-fit px-4">
                <div className="grid gap-1 sm:gap-2" style={{
                gridTemplateColumns: `repeat(${upperTeeth.length}, minmax(0, 1fr))`
              }}>
                  {upperTeeth.map(tooth => <ToothButton key={tooth} toothNumber={tooth} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Jaw */}
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Lower Jaw</h3>
            <div className="overflow-x-auto pb-2">
              <div className="flex justify-center min-w-fit px-4">
                <div className="grid gap-1 sm:gap-2" style={{
                gridTemplateColumns: `repeat(${lowerTeeth.length}, minmax(0, 1fr))`
              }}>
                  {lowerTeeth.map(tooth => <ToothButton key={tooth} toothNumber={tooth} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Tooth Actions */}
        {selectedTooth && <Card className="bg-accent/10 border-accent/30">
            <CardContent className="p-4">
              <h3 className="font-semibold text-accent-foreground mb-4 text-center sm:text-left">
                Selected Tooth: {selectedTooth}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button onClick={() => markTooth('healthy')} className="bg-tooth-healthy hover:bg-tooth-healthy/80 text-white min-h-[44px] touch-manipulation" size="sm">
                  Mark Healthy
                </Button>
                <Button onClick={() => markTooth('problem')} className="bg-tooth-problem hover:bg-tooth-problem/80 text-white min-h-[44px] touch-manipulation" size="sm">
                  Problem
                </Button>
                <Button onClick={() => markTooth('treated')} className="bg-tooth-treated hover:bg-tooth-treated/80 text-white min-h-[44px] touch-manipulation" size="sm">
                  Treated
                </Button>
                <Button onClick={() => markTooth('missing')} className="bg-tooth-missing hover:bg-tooth-missing/80 text-white min-h-[44px] touch-manipulation" size="sm">
                  Missing
                </Button>
              </div>
            </CardContent>
          </Card>}
      </CardContent>
    </Card>;
}