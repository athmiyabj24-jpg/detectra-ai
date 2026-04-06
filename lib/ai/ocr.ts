// Simulated OCR text extraction
const SAMPLE_OCR_TEXTS = [
  'Our packaging is made from 100% recycled materials. Join us in protecting the planet.',
  'Eco-friendly product. Made with sustainable ingredients. Zero carbon footprint.',
  'Certified organic and naturally sourced. Good for you, good for the Earth.',
  'We are committed to reducing our environmental impact by 50% by 2030.',
  'This product uses renewable energy in its manufacturing process.',
  'Plant-based formula. No harmful chemicals. Biodegradable packaging.',
  'Carbon neutral certified. Every purchase plants a tree.',
  'Sustainably harvested ingredients from responsible suppliers worldwide.',
];

export async function extractTextFromImage(imagePath: string): Promise<string> {
  // Simulate OCR processing
  // In a real implementation, this would use an OCR service like Tesseract or Google Vision

  // Return a sample text based on the image name hash or random
  const hash = imagePath.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % SAMPLE_OCR_TEXTS.length;
  
  return SAMPLE_OCR_TEXTS[index];
}

export function getOCRConfidence(): number {
  // Simulate OCR confidence score
  return 0.85 + Math.random() * 0.1; // 85-95% confidence
}
