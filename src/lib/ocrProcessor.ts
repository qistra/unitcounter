
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js settings
env.allowLocalModels = false;
env.useBrowserCache = false;

// Initialize the OCR model - will load on first use
let ocrModelPromise: Promise<any> | null = null;

/**
 * Initialize the OCR pipeline once
 */
const getOcrPipeline = async () => {
  if (!ocrModelPromise) {
    // Create a new promise for loading the model
    ocrModelPromise = pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', {
      revision: 'v2.0.0',
    });
  }
  return ocrModelPromise;
};

/**
 * Process an image file with OCR to extract meter readings
 * @param imageFile The image file to process
 * @returns Promise resolving to the recognized meter reading
 */
export const recognizeTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    // Get image data as base64
    const imageBase64 = await fileToBase64(imageFile);
    
    // Get OCR pipeline
    const model = await getOcrPipeline();
    
    // Process the image
    const result = await model(imageBase64);
    
    // Extract the detected text
    let detectedText = '';
    if (result && result.length > 0) {
      detectedText = result[0].generated_text || '';
    }
    
    // Extract numeric values from the text
    const numericValue = extractNumberFromText(detectedText);
    return numericValue || '';
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image. Please try again or enter reading manually.');
  }
};

/**
 * Helper function to extract numeric values from text
 * @param text Text to extract numbers from
 * @returns Extracted number as string, or null if no number found
 */
const extractNumberFromText = (text: string): string | null => {
  // First try to find sequences of digits that look like meter readings
  // This pattern looks for sequences of digits, possibly with decimal points
  const meterReadingPattern = /\b\d+(\.\d+)?\b/g;
  const matches = text.match(meterReadingPattern);
  
  if (matches && matches.length > 0) {
    // Return the first match as our best guess for the meter reading
    return matches[0];
  }
  
  return null;
};

/**
 * Convert a file to base64 encoding
 * @param file File to convert
 * @returns Promise resolving to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
