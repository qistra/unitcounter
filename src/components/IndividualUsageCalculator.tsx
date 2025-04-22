
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeterImageUploader } from "@/components/MeterImageUploader";
import { calculateUsage, validateReading } from "@/utils/ocrUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

interface IndividualUsageCalculatorProps {
  onUsageCalculated: (usage: number | null) => void;
}

export function IndividualUsageCalculator({ onUsageCalculated }: IndividualUsageCalculatorProps) {
  const [startReading, setStartReading] = useState("");
  const [endReading, setEndReading] = useState("");
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    setError("");
    setShowResult(false);
    onUsageCalculated(null);
    
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
      onUsageCalculated(result);
      setShowResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
      onUsageCalculated(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Individual Meter Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <MeterImageUploader 
          label="Start Meter Reading" 
          onReadingChange={(value) => {
            setStartReading(value);
            setShowResult(false);
          }} 
        />
        
        <MeterImageUploader 
          label="End Meter Reading" 
          onReadingChange={(value) => {
            setEndReading(value);
            setShowResult(false);
          }} 
        />
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}
        
        {showResult && !error && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Calculation Result</AlertTitle>
            <AlertDescription className="font-semibold text-sm">
              Your electricity usage is: {calculateUsage(parseFloat(startReading), parseFloat(endReading)).toFixed(2)} kWh
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3" 
          onClick={handleCalculate}
          disabled={!startReading || !endReading}
        >
          Calculate Usage
        </Button>
      </CardFooter>
    </Card>
  );
}
