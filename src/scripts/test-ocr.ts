
import { recognizeTextFromImage } from '../lib/ocrProcessor';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

// Function to create a test image file
async function createTestImageFile(url: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], 'test-meter.jpg', { type: 'image/jpeg' });
}

// Test the OCR functionality
async function testOCR() {
  try {
    // Read the test image file
    const imagePath = path.join(process.cwd(), 'src', 'test-images', 'meter-reading.jpg');
    const imageBuffer = await fs.readFile(imagePath);
    
    // Create a File object from the buffer
    const imageFile = new File([imageBuffer], 'meter-reading.jpg', { type: 'image/jpeg' });
    
    console.log('Testing OCR with image file:', imageFile.name);
    const result = await recognizeTextFromImage(imageFile);
    console.log('OCR Result:', result);
    
    // Validate the result
    const expectedReading = '00007.2';
    if (result === expectedReading) {
      console.log('✅ Test passed! Correctly identified the meter reading with decimal place.');
    } else {
      console.log('❌ Test failed!');
      console.log('Expected:', expectedReading);
      console.log('Got:', result);
      console.log('Note: The decimal place handling might need adjustment if the format is different.');
    }
  } catch (error) {
    console.error('OCR Test failed:', error);
  }
}

testOCR();
