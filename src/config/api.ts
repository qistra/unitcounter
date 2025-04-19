// Try to get API key from Vite env first, then fallback to process.env
export const DEEPSEEK_API_KEY = 
  typeof import.meta !== 'undefined' ? 
    import.meta.env.VITE_DEEPSEEK_API_KEY : 
    process.env.VITE_DEEPSEEK_API_KEY;

export const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/vision/detect_text';

if (!DEEPSEEK_API_KEY) {
  console.warn('DeepSeek API key is not configured. OCR functionality will not work.');
} 