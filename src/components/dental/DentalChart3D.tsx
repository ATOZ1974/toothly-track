import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { ToothModel } from './ToothModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ToothState, ToothStatus } from '@/types/dental';

interface DentalChart3DProps {
  selectedTooth: number | null;
  toothStates: ToothState;
  patientAge: number | null;
  onToothSelect: (tooth: number) => void;
  onToothStateChange: (tooth: number, state: ToothStatus) => void;
}

export function DentalChart3D({
  selectedTooth,
  toothStates,
  patientAge,
  onToothSelect,
  onToothStateChange,
}: DentalChart3DProps) {
  const isChild = patientAge !== null && patientAge < 12;

  // Adult teeth numbering (1-32)
  const upperAdultTeeth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const lowerAdultTeeth = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

  // Primary teeth numbering (51-85)
  const upperPrimaryTeeth = [51, 52, 53, 54, 55, 61, 62, 63, 64, 65];
  const lowerPrimaryTeeth = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

  const upperTeeth = isChild ? upperPrimaryTeeth : upperAdultTeeth;
  const lowerTeeth = isChild ? lowerPrimaryTeeth : lowerAdultTeeth;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>3D Dental Chart</CardTitle>
          <Badge variant="outline">
            {isChild ? 'Primary Dentition' : 'Adult Dentition'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[500px] bg-background/50 rounded-lg overflow-hidden border">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 5, 15]} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={30}
            />
            
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              {/* Upper Arch */}
              {upperTeeth.map((toothNumber, index) => {
                const x = (index - upperTeeth.length / 2) * 1.2;
                const z = Math.sin((index / upperTeeth.length) * Math.PI) * 3;
                return (
                  <ToothModel
                    key={toothNumber}
                    toothNumber={toothNumber}
                    position={[x, 2, z]}
                    isSelected={selectedTooth === toothNumber}
                    state={toothStates[toothNumber]}
                    onClick={onToothSelect}
                  />
                );
              })}
              
              {/* Lower Arch */}
              {lowerTeeth.map((toothNumber, index) => {
                const x = (index - lowerTeeth.length / 2) * 1.2;
                const z = Math.sin((index / lowerTeeth.length) * Math.PI) * 3;
                return (
                  <ToothModel
                    key={toothNumber}
                    toothNumber={toothNumber}
                    position={[x, -2, z]}
                    isSelected={selectedTooth === toothNumber}
                    state={toothStates[toothNumber]}
                    onClick={onToothSelect}
                  />
                );
              })}
            </Suspense>
          </Canvas>
          
          {!selectedTooth && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                Click on a tooth to select • Drag to rotate • Scroll to zoom
              </p>
            </div>
          )}
        </div>

        {/* Selected Tooth Actions */}
        {selectedTooth && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm font-medium mb-3">
              Tooth {selectedTooth} - Mark as:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToothStateChange(selectedTooth, 'healthy')}
                className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
              >
                ✓ Healthy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToothStateChange(selectedTooth, 'problem')}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30"
              >
                ⚠ Problem
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToothStateChange(selectedTooth, 'treated')}
                className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
              >
                ⚕ Treated
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToothStateChange(selectedTooth, 'missing')}
                className="bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30"
              >
                ✗ Missing
              </Button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="text-sm">Problem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-sm">Treated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500" />
            <span className="text-sm">Missing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
