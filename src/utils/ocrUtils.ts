
// OCR Utility Functions
// In a real application, this would use @huggingface/transformers for actual OCR
// This is a simplified simulation for demo purposes

/**
 * Simulates OCR processing on an uploaded meter image
 * @param file The image file to process
 * @returns A promise that resolves to a random meter reading number
 */
export const processImageOCR = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Simulate OCR processing time
    setTimeout(() => {
      try {
        if (!file || !file.type.startsWith('image/')) {
          throw new Error('Invalid file type. Please upload an image.');
        }
        
        // In a real app, we would use the transformers library here
        // This is just a simulation that returns a random number
        const randomReading = (Math.random() * 10000).toFixed(2);
        resolve(randomReading);
      } catch (error) {
        reject(error);
      }
    }, 1500); // Simulate processing delay
  });
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
