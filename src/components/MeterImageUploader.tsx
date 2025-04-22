import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { processImageOCR, createImagePreview, validateReading } from "@/utils/ocrUtils";
import { Loader2, Camera, AlertCircle, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MeterImageUploaderProps {
  label: string;
  onReadingChange: (reading: string) => void;
}

export function MeterImageUploader({ label, onReadingChange }: MeterImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [reading, setReading] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const { toast } = useToast();

  const processImage = async (file: File) => {
    if (!file) return;
    
    setIsProcessing(true);
    setModelLoading(true);
    setError('');
    setOcrSuccess(false);
    
    try {
      console.log("Starting OCR process for file:", file.name);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await processImageOCR(file);
      console.log("OCR process completed, result:", result);
      
      setReading(result);
      onReadingChange(result);
      setIsProcessing(false);
      setModelLoading(false);
      setOcrSuccess(true);
      
      toast({
        title: "OCR Successful",
        description: `Detected reading: ${result}`,
        variant: "default"
      });
    } catch (err) {
      console.error("OCR process failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error processing image';
      setError(errorMessage);
      setIsProcessing(false);
      setModelLoading(false);
      
      toast({
        title: "OCR Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setPreview(createImagePreview(file));
    processImage(file);
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
  
  const handleRetry = () => {
    if (selectedFile) {
      processImage(selectedFile);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <Label htmlFor={`${label}-upload`}>{label}</Label>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Card className="flex-1 p-4 border-dashed border-2 flex flex-col items-center justify-center min-h-[150px] sm:min-h-[200px]">
          {preview ? (
            <div className="w-full h-full flex flex-col items-center">
              <div className="relative w-full h-24 sm:h-32 mb-2">
                <img 
                  src={preview} 
                  alt="Meter preview" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById(`${label}-upload`)?.click()}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Change
                </Button>
                {selectedFile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRetry}
                    disabled={isProcessing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Upload your meter image
              </p>
              <Button 
                variant="outline"
                size="sm"
                className="sm:text-sm"
                onClick={() => document.getElementById(`${label}-upload`)?.click()}
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
            onClick={(e) => {
              (e.target as HTMLInputElement).value = '';
            }}
          />
        </Card>
        
        <div className="flex-1">
          <Label htmlFor={`${label}-reading`} className="block text-sm mb-1">OCR Result</Label>
          <div className="relative">
            <Input
              id={`${label}-reading`}
              value={reading}
              onChange={handleReadingChange}
              placeholder="Reading"
              disabled={isProcessing}
              className={`text-sm ${error ? "border-red-500" : ""}`}
            />
            {isProcessing && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {ocrSuccess && !isProcessing && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
            {error && !isProcessing && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          {error && <p className="text-xs sm:text-sm text-red-500 mt-1">{error}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {selectedFile ? selectedFile.name : "No file chosen"}
          </p>
          {selectedFile && (
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
              You can always adjust the reading if OCR is not accurate
            </p>
          )}
          
          {modelLoading && (
            <Alert className="mt-2 bg-blue-50 py-2">
              <AlertDescription className="flex items-center text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading OCR model...
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
