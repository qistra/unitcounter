
/**
 * DeepSeek-based OCR processor for meter readings
 * Now delegating OCR processing to Supabase Edge Function
 */

// Removed direct API key and processing logic
export const recognizeTextFromImage = async (imageFile: File): Promise<string> => {
  throw new Error('OCR processing now handled by Supabase Edge Function. Use processImageOCR instead.');
};
