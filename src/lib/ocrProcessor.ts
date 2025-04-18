
/**
 * DeepSeek-based OCR processor for meter readings
 */

// API key will be provided by the user
const DEEPSEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"; // Replace this with actual API key

/**
 * Process an image file with DeepSeek OCR to extract meter readings
 * @param imageFile The image file to process
 * @returns Promise resolving to the recognized meter reading
 */
export const recognizeTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    console.log('Starting DeepSeek OCR processing for file:', imageFile.name);
    
    // Convert the file to base64
    const base64Image = await fileToBase64(imageFile);
    const base64Data = base64Image.split(',')[1]; // Remove the data:image/format;base64, prefix
    
    console.log('Image converted to base64, sending to DeepSeek API');
    
    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/vision/detect_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        image: base64Data,
        options: {
          language: "auto"  // Auto detect language
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DeepSeek OCR response:', data);
    
    // Extract the detected text from DeepSeek response
    let detectedText = '';
    if (data && data.text) {
      detectedText = data.text;
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
