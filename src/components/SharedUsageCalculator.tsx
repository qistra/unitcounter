
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MeterImageUploader } from "@/components/MeterImageUploader";
import { validateReading } from "@/utils/ocrUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function SharedUsageCalculator() {
  const [yourMeterReading, setYourMeterReading] = useState("");
  const [sharedMeterReading, setSharedMeterReading] = useState("");
  const [calculationResult, setCalculationResult] = useState<{
    yourUsage: number;
    remainingUnits: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    setError("");
    setCalculated(false);
    
    if (!yourMeterReading || !sharedMeterReading) {
      setError("Please provide both meter readings");
      return;
    }
    
    if (!validateReading(yourMeterReading) || !validateReading(sharedMeterReading)) {
      setError("Please enter valid positive numbers for both readings");
      return;
    }
    
    const yourUsage = parseFloat(yourMeterReading);
    const remaining = parseFloat(sharedMeterReading);
    
    setCalculationResult({
      yourUsage,
      remainingUnits: remaining
    });
    setCalculated(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Electricity Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <MeterImageUploader 
          label="Your Meter Reading (Prepaid Meter Reader)" 
          onReadingChange={setYourMeterReading} 
        />
        
        <MeterImageUploader 
          label="Shared Meter (Remaining)" 
          onReadingChange={setSharedMeterReading} 
        />
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {calculated && calculationResult && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Calculation Result</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">You Have Used: {calculationResult.yourUsage.toFixed(2)} kWh</p>
                <p className="font-semibold">Remaining Units: {calculationResult.remainingUnits.toFixed(2)} kWh</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={handleCalculate}
          disabled={!yourMeterReading || !sharedMeterReading}
        >
          Calculate Usage
        </Button>
      </CardFooter>
    </Card>
  );
}
