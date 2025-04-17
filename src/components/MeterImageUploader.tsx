
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { processImageOCR, createImagePreview, validateReading } from "@/utils/ocrUtils";
import { Loader2 } from "lucide-react";

interface MeterImageUploaderProps {
  label: string;
  onReadingChange: (reading: string) => void;
}

export function MeterImageUploader({ label, onReadingChange }: MeterImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [reading, setReading] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setPreview(createImagePreview(file));
    setError('');
    setIsProcessing(true);
    
    try {
      const result = await processImageOCR(file);
      setReading(result);
      onReadingChange(result);
      setIsProcessing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing image');
      setIsProcessing(false);
    }
  };

  const handleReadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReading(value);
    
    if (validateReading(value)) {
      onReadingChange(value);
      setError('');
    } else {
      setError('Please enter a valid positive number');
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor={`${label}-upload`}>{label}</Label>
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 p-4 border-dashed border-2 flex flex-col items-center justify-center min-h-[200px]">
          {preview ? (
            <div className="w-full h-full flex flex-col items-center">
              <div className="relative w-full h-32 mb-2">
                <img 
                  src={preview} 
                  alt="Meter preview" 
                  className="w-full h-full object-contain"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById(`${label}-upload`)?.click()}
              >
                Change Image
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Upload your meter image
              </p>
              <Button 
                variant="outline"
                onClick={() => document.getElementById(`${label}-upload`)?.click()}
              >
                Choose file
              </Button>
            </div>
          )}
          <Input
            id={`${label}-upload`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </Card>
        
        <div className="flex-1">
          <Label htmlFor={`${label}-reading`}>OCR Result</Label>
          <div className="relative">
            <Input
              id={`${label}-reading`}
              value={reading}
              onChange={handleReadingChange}
              placeholder="Reading"
              disabled={isProcessing}
              className={error ? "border-red-500" : ""}
            />
            {isProcessing && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            {selectedFile ? selectedFile.name : "No file chosen"}
          </p>
        </div>
      </div>
    </div>
  );
}
