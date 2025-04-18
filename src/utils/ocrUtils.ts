
import { supabase } from '@/integrations/supabase/client';

/**
 * Process an uploaded meter image using OCR via Supabase Edge Function
 * @param file The image file to process
 * @returns A promise that resolves to the recognized meter reading
 */
export const processImageOCR = async (file: File): Promise<string> => {
  try {
    console.log('Processing image with DeepSeek OCR:', file);
    
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }
    
    // Check file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      console.warn('Image is large, may affect processing:', file.size);
    }
    
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('image', file);
    
    // Call Supabase Edge Function for OCR
    const { data, error } = await supabase.functions.invoke('ocr-process', {
      body: formData
    });
    
    if (error) throw error;
    
    const result = data.numericValue;
    
    if (!result || result.trim() === '') {
      // If OCR couldn't detect any numbers, provide feedback
      console.warn('No reading detected in the image');
      throw new Error('No meter reading detected. Please try with a clearer image or enter reading manually.');
    }
    
    return result;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
};

/**
 * Creates a preview URL for the uploaded image
 * @param file The image file
 * @returns The object URL for the image
 */
export const createImagePreview = (file: File): string => {
  if (!file) return '';
  return URL.createObjectURL(file);
};

/**
 * Validates meter reading input
 * @param value The reading value to validate
 * @returns Boolean indicating if value is valid
 */
export const validateReading = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
};

/**
 * Calculates the difference between two meter readings
 * @param start Starting meter reading
 * @param end Ending meter reading
 * @returns The calculated usage (end - start)
 */
export const calculateUsage = (start: number, end: number): number => {
  if (end < start) {
    throw new Error('End reading must be greater than or equal to start reading');
  }
  return end - start;
};
