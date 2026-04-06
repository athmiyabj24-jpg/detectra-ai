// Simulated video transcription (like Whisper)
const SAMPLE_TRANSCRIPTS = [
  `At our company, we believe in a sustainable future. That's why we've made a commitment 
   to reduce our carbon emissions by 40% over the next decade. Our factories now run on 
   100% renewable energy, and we're working with local communities to plant over one million 
   trees. Together, we can make a difference.`,
  
  `Introducing our new eco-friendly product line. Made with love for the planet. 
   Our products are completely natural, using only organic ingredients sourced from 
   sustainable farms. No artificial chemicals, no harmful additives. Just pure, 
   natural goodness for you and the environment.`,
  
  `We're proud to announce that our company has achieved carbon neutrality. 
   Through innovative technologies and carbon offset programs, we've eliminated 
   our environmental footprint. This is just the beginning of our journey 
   towards a greener tomorrow.`,
  
  `Did you know? Every product you buy from us supports environmental conservation. 
   We donate 1% of all sales to ocean cleanup initiatives and rainforest preservation. 
   Plus, our packaging is fully recyclable and made from post-consumer materials. 
   Make the sustainable choice today.`,
  
  `Our sustainability report shows remarkable progress. We've reduced water usage 
   by 35%, eliminated single-use plastics from our supply chain, and increased 
   energy efficiency by 28%. These achievements were verified by independent 
   third-party auditors and align with the UN Sustainable Development Goals.`,
];

export async function transcribeVideo(videoPath: string): Promise<string> {
  // Simulate video transcription
  // In a real implementation, this would use a service like Whisper or Google Speech-to-Text

  // Return a sample transcript based on the video path hash
  const hash = videoPath.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % SAMPLE_TRANSCRIPTS.length;
  
  return SAMPLE_TRANSCRIPTS[index].replace(/\s+/g, ' ').trim();
}

export function getTranscriptionConfidence(): number {
  // Simulate transcription confidence score
  return 0.88 + Math.random() * 0.1; // 88-98% confidence
}
