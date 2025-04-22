
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MeterImageUploader } from "@/components/MeterImageUploader";
import { validateReading } from "@/utils/ocrUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface SharedUsageCalculatorProps {
  personalUsage: number | null;
}

export function SharedUsageCalculator({ personalUsage }: SharedUsageCalculatorProps) {
  const [initiallyRechargedUnits, setInitiallyRechargedUnits] = useState("");
  const [currentRemainingUnits, setCurrentRemainingUnits] = useState("");
  const [manualPersonalUsage, setManualPersonalUsage] = useState("");
  const [calculationResult, setCalculationResult] = useState<{
    totalSharedUsage: number;
    othersUsage: number;
    effectivePersonalUsage: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    setError("");
    setWarnings([]);
    setCalculated(false);
    
    if (!initiallyRechargedUnits || !currentRemainingUnits) {
      setError("Please provide both Initially Recharged Units and Current Remaining Units");
      return;
    }
    
    if (!validateReading(initiallyRechargedUnits) || !validateReading(currentRemainingUnits)) {
      setError("Please enter valid positive numbers for both readings");
      return;
    }
    
    const initial = parseFloat(initiallyRechargedUnits);
    const remaining = parseFloat(currentRemainingUnits);
    const effectivePersonal = manualPersonalUsage ? parseFloat(manualPersonalUsage) : (personalUsage || 0);
    
    // Validation checks
    if (remaining > initial) {
      setError("Current Remaining Units cannot be greater than Initially Recharged Units");
      return;
    }
    
    const totalShared = initial - remaining;
    const othersUsage = totalShared - effectivePersonal;
    
    // Warning checks
    const newWarnings: string[] = [];
    if (othersUsage < 0) {
      newWarnings.push("Warning: Your personal usage exceeds the total shared usage");
    }
    if (effectivePersonal > totalShared) {
      newWarnings.push("Warning: Your personal usage is greater than the total shared usage");
    }
    setWarnings(newWarnings);
    
    setCalculationResult({
      totalSharedUsage: totalShared,
      othersUsage: Math.max(0, othersUsage), // Prevent negative others usage in display
      effectivePersonalUsage: effectivePersonal
    });
    setCalculated(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Electricity Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="initiallyRechargedUnits">Initially Recharged Units (kWh)</Label>
          <Input
            id="initiallyRechargedUnits"
            type="number"
            step="0.01"
            value={initiallyRechargedUnits}
            onChange={(e) => setInitiallyRechargedUnits(e.target.value)}
            placeholder="Enter initially recharged units"
            className="w-full"
          />
        </div>
        
        <MeterImageUploader 
          label="Current Remaining Units (kWh)" 
          onReadingChange={setCurrentRemainingUnits} 
        />
        
        <div className="space-y-2">
          <Label htmlFor="personalUsage">Your Personal Usage (kWh)</Label>
          <Input
            id="personalUsage"
            type="number"
            step="0.01"
            value={manualPersonalUsage || (personalUsage?.toString() || "")}
            onChange={(e) => setManualPersonalUsage(e.target.value)}
            placeholder={personalUsage ? `Auto-filled: ${personalUsage.toFixed(2)}` : "Enter your personal usage"}
            className={personalUsage && !manualPersonalUsage ? "bg-gray-50 w-full" : "w-full"}
          />
          {personalUsage && !manualPersonalUsage && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Auto-filled from Individual tab calculation</p>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {warnings.map((warning, index) => (
          <Alert key={index} className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}
        
        {calculated && calculationResult && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Calculation Result</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Total Shared Usage: {calculationResult.totalSharedUsage.toFixed(2)} kWh</p>
                <p className="font-semibold">Your Usage: {calculationResult.effectivePersonalUsage.toFixed(2)} kWh</p>
                <p className="font-semibold">Other's Usage: {calculationResult.othersUsage.toFixed(2)} kWh</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={handleCalculate}
          disabled={!initiallyRechargedUnits || !currentRemainingUnits}
        >
          Calculate Usage
        </Button>
      </CardFooter>
    </Card>
  );
}
