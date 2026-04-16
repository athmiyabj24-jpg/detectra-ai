import type { ClassificationLabel } from '../types';

export function analyzeNLP(text: string): {
  label: ClassificationLabel;
  confidence: number;
  reasons: string[];
} {
  const input = text.toLowerCase();

  // ================================
  // ❌ FALSE (highest priority)
  // ================================
  const falsePatterns = [
    /without any energy/,
    /without energy/,
    /without fuel/,
    /without batteries/,
    /without power/,
    /without water/,
    /without soil/,
    /without sunlight/,
    /without any materials/,
    /without any process/,
    /no environmental impact at all/,
    /zero emissions completely/,
    /run without hardware/,
    /no input/,
    /disappear immediately/,
    /generated without any energy source/
  ];

  if (falsePatterns.some((p) => p.test(input))) {
    return {
      label: 'false',
      confidence: 0.95,
      reasons: ['Scientifically impossible or unrealistic claim']
    };
  }

  // ================================
  // 🚀 EXAGGERATED
  // ================================
  const exaggeratedPatterns = [
    /entire world/,
    /completely sustainable/,
    /100% sustainable/,
    /all global/,
    /entire global/,
    /eliminating all/,
    /ending all/,
    /powering the world/,
    /feeding the entire global/,
    /completely sustainable digital world/,
    /global infrastructure network/
  ];

  if (exaggeratedPatterns.some((p) => p.test(input))) {
    return {
      label: 'exaggerated',
      confidence: 0.9,
      reasons: ['Overstated or unrealistic scale of impact']
    };
  }

  // ================================
  // ⚠️ MISLEADING
  // ================================
  const misleadingPatterns = [
    /some/,
    /certain/,
    /selected/,
    /include/,
    /designed with/,
    /support/,
    /may/,
    /can/,
    /in certain/,
    /features/,
    /incorporate/,
    /utilize/,
    /environmentally conscious/,
    /environmentally friendly/
  ];

  if (misleadingPatterns.some((p) => p.test(input))) {
    return {
      label: 'misleading',
      confidence: 0.75,
      reasons: ['Vague or lacks specific measurable data']
    };
  }

  // ================================
  // ✅ GENUINE
  // ================================
  const hasNumbers = /\d+%/.test(input);
  const hasYear = /20\d{2}/.test(input);
  const hasVerification = /iso|certified|verified/.test(input);

  if (hasNumbers && hasYear && hasVerification) {
    return {
      label: 'genuine',
      confidence: 0.95,
      reasons: ['Specific, measurable, and verified claim']
    };
  }

  // ================================
  // DEFAULT → MISLEADING
  // ================================
  return {
    label: 'misleading',
    confidence: 0.6,
    reasons: ['Insufficient clarity or detail']
  };
}