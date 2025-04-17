
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeterImageUploader } from "@/components/MeterImageUploader";
import { calculateUsage, validateReading } from "@/utils/ocrUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function IndividualUsageCalculator() {
  const [startReading, setStartReading] = useState("");
  const [endReading, setEndReading] = useState("");
  const [usage, setUsage] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    setError("");
    setCalculated(false);
    
    if (!startReading || !endReading) {
      setError("Please provide both start and end readings");
      return;
    }
    
    if (!validateReading(startReading) || !validateReading(endReading)) {
      setError("Please enter valid positive numbers for both readings");
      return;
    }
    
    const start = parseFloat(startReading);
    const end = parseFloat(endReading);
    
    try {
      const result = calculateUsage(start, end);
      setUsage(result);
      setCalculated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Meter Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <MeterImageUploader 
          label="Start Meter Reading" 
          onReadingChange={setStartReading} 
        />
        
        <MeterImageUploader 
          label="End Meter Reading" 
          onReadingChange={setEndReading} 
        />
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {calculated && usage !== null && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Calculation Result</AlertTitle>
            <AlertDescription className="font-semibold">
              Your electricity usage is: {usage.toFixed(2)} kWh
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={handleCalculate}
          disabled={!startReading || !endReading}
        >
          Calculate Usage
        </Button>
      </CardFooter>
    </Card>
  );
}
