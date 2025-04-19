import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL } from '@/config/api';

/**
 * DeepSeek-based OCR processor for meter readings
 */
export const recognizeTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call DeepSeek OCR API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        image: base64Data,
        options: {
          language: "auto"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract numeric value from detected text
    const detectedText = data.text || '';
    const numericValue = extractNumberFromText(detectedText);
    
    if (!numericValue) {
      throw new Error('No meter reading detected. Please try with a clearer image or enter reading manually.');
    }

    return numericValue;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
};

/**
 * Helper function to extract and format numeric values from text
 * Handles both decimal and non-decimal meter readings
 */
function extractNumberFromText(text: string): string | null {
  // First try to find sequences that look like meter readings with decimals
  const meterReadingPattern = /\b\d+(\.\d+)?\b/g;
  const matches = text.match(meterReadingPattern);
  
  if (matches && matches.length > 0) {
    let reading = matches[0];
    
    // If it's a 6-digit number without decimal, insert decimal point before last digit
    if (/^\d{6}$/.test(reading)) {
      reading = reading.slice(0, -1) + '.' + reading.slice(-1);
    }
    
    // If it's a 5-digit number, check if it needs a decimal
    if (/^\d{5}$/.test(reading)) {
      // For meter readings, we typically want to add a decimal
      // Only add if there isn't already one
      if (!reading.includes('.')) {
        reading = reading + '.0';
      }
    }
    
    return reading;
  }
  
  // If no obvious meter reading pattern is found, try a more aggressive approach
  const anyDigitPattern = /\d+/g;
  const digitsOnly = text.match(anyDigitPattern);
  
  if (digitsOnly && digitsOnly.length > 0) {
    let reading = digitsOnly[0];
    
    // Apply the same decimal place logic
    if (reading.length === 6) {
      reading = reading.slice(0, -1) + '.' + reading.slice(-1);
    } else if (reading.length === 5) {
      reading = reading + '.0';
    }
    
    return reading;
  }
  
  return null;
}
