
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js settings for optimal browser performance
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 4;

// Initialize the OCR model - will load on first use
let ocrModelPromise: Promise<any> | null = null;

/**
 * Initialize the OCR pipeline once
 */
const getOcrPipeline = async () => {
  if (!ocrModelPromise) {
    console.log('Loading OCR model...');
    try {
      // Create a new promise for loading the model
      ocrModelPromise = pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', {
        revision: 'v2.0.0',
      });
      console.log('OCR model loaded successfully');
    } catch (error) {
      console.error('Error loading OCR model:', error);
      ocrModelPromise = null;
      throw new Error('Failed to load OCR model. Please try again later.');
    }
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
    console.log('Starting OCR processing for file:', imageFile.name);
    
    // Get image data as base64
    const imageBase64 = await fileToBase64(imageFile);
    console.log('Image converted to base64');
    
    // Get OCR pipeline
    console.log('Getting OCR pipeline...');
    const model = await getOcrPipeline();
    
    // Process the image
    console.log('Processing image with OCR model...');
    const result = await model(imageBase64);
    console.log('OCR result:', result);
    
    // Extract the detected text
    let detectedText = '';
    if (result && result.length > 0) {
      detectedText = result[0].generated_text || '';
      console.log('Detected text:', detectedText);
    }
    
    // Extract numeric values from the text
    const numericValue = extractNumberFromText(detectedText);
    console.log('Extracted numeric value:', numericValue);
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
  console.log('Extracting numbers from text:', text);
  
  // First try to find sequences of digits that look like meter readings
  // This pattern looks for sequences of digits, possibly with decimal points
  const meterReadingPattern = /\b\d+(\.\d+)?\b/g;
  const matches = text.match(meterReadingPattern);
  
  if (matches && matches.length > 0) {
    console.log('Found numeric matches:', matches);
    // Return the first match as our best guess for the meter reading
    return matches[0];
  }
  
  // If no obvious meter reading pattern is found, try a more aggressive approach
  // Extract any digit sequence
  console.log('No standard meter reading found, trying fallback extraction');
  const anyDigitPattern = /\d+/g;
  const digitsOnly = text.match(anyDigitPattern);
  
  if (digitsOnly && digitsOnly.length > 0) {
    console.log('Found digit sequences:', digitsOnly);
    return digitsOnly[0];
  }
  
  console.log('No numeric values found in text');
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
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};
