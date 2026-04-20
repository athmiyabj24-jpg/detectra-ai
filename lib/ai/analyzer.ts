import type { 
  AnalysisResult, 
  Company, 
  InputType, 
  ClassificationLabel,
  RiskLevel,
  SuspiciousPhrase,
  SimilarityResult 
} from '../types';

import { analyzeNLP } from './nlp';
import { extractTextFromImage } from './ocr';
import { transcribeVideo } from './video';
import { computeSimilarity } from './similarity';
import { detectSuspiciousPhrases } from './explainer';

// ================================
// 🧠 NORMALIZE TEXT (OCR FIX)
// ================================
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9% ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ================================
// 🔥 CLASSIFIER (FINAL FIXED)
// ================================
function classifyClaimRule(text: string): ClassificationLabel {

  const t = normalizeText(text);

  // ❌ FALSE
  if (
    t.includes("without") &&
    (
      t.includes("material") ||
      t.includes("resource") ||
      t.includes("energy") ||
      t.includes("fuel") ||
      t.includes("water") ||
      t.includes("soil") ||
      t.includes("sunlight")
    )
  ) {
    return "false";
  }

  // 🚀 EXAGGERATED
  if (
    t.includes("100") ||
    t.includes("entire world") ||
    t.includes("whole world") ||
    t.includes("global") ||
    t.includes("everyone") ||
    t.includes("completely") ||
    t.includes("eliminating all") ||
    t.includes("ending all")
  ) {
    return "exaggerated";
  }

  // ✅ GENUINE
  const hasNumber = /\d/.test(t);
  const hasTime =
    t.includes("between") ||
    t.includes("from") ||
    t.includes("during");

  const hasVerification =
    t.includes("iso") ||
    t.includes("certified") ||
    t.includes("verified") ||
    t.includes("fsc") ||
    t.includes("rainforest");

  const hasSustainability =
    t.includes("emission") ||
    t.includes("efficiency") ||
    t.includes("materials") ||
    t.includes("sourced") ||
    t.includes("reduction");

  if (hasNumber && hasTime && hasVerification && hasSustainability) {
    return "genuine";
  }

  // ⚠️ MISLEADING
  return "misleading";
}

// ================================
// 🚀 MAIN FUNCTION
// ================================
export async function analyzeClaimSimulated(
  input: string,
  inputType: InputType,
  company: Company,
  onStepChange: (step: number) => void
): Promise<AnalysisResult> {

  const startTime = Date.now();
  let textToAnalyze = input;

  // STEP 1: Extract text
  onStepChange(1);
  if (inputType === 'image') {
    await delay(1500);
    textToAnalyze = await extractTextFromImage(input);
  } else if (inputType === 'video') {
    await delay(2000);
    textToAnalyze = await transcribeVideo(input);
  } else {
    await delay(500);
  }

  // 🔥 FIX OCR TEXT
  textToAnalyze = normalizeText(textToAnalyze);

  // STEP 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(textToAnalyze);

  // 🔥 FORCE FINAL LABEL
  nlpResult.label = classifyClaimRule(textToAnalyze);

  // STEP 3: Historical comparison
  onStepChange(3);
  await delay(1000);
  const similarityResult = computeSimilarity(
    textToAnalyze,
    company.historicalClaims
  );

  // STEP 4: Suspicious phrases
  onStepChange(4);
  await delay(800);
  const suspiciousPhrases = detectSuspiciousPhrases(textToAnalyze);

  // STEP 5: Risk calculation
  onStepChange(5);
  await delay(600);
  const riskScores = calculateRiskScores(
    nlpResult,
    similarityResult,
    suspiciousPhrases,
    company
  );

  // STEP 6: Final result
  onStepChange(6);
  await delay(400);

  const processingTime = Date.now() - startTime;

  return {
    id: `analysis-${Date.now()}`,
    companyId: company.id,
    companyName: company.name,
    inputType,
    originalInput: input,
    extractedText: textToAnalyze,
    classification: nlpResult,
    riskScores,
    suspiciousPhrases,
    historicalComparison: similarityResult,
    sustainabilityCheck: generateSustainabilityCheck(nlpResult), // ✅ FIXED
    createdAt: new Date().toISOString(),
    processingTime,
  };
}

// ================================
// 📊 RISK CALCULATION
// ================================
function calculateRiskScores(
  nlpResult: { label: ClassificationLabel; confidence: number; reasons: string[] },
  similarityResult: { consistencyScore: number; similarities: SimilarityResult[]; contradictions: SimilarityResult[] },
  suspiciousPhrases: SuspiciousPhrase[],
  company: Company
): { greenwashingRisk: number; companyCredibility: number; riskLevel: RiskLevel } {

  const classificationRisk: Record<ClassificationLabel, number> = {
    genuine: 10,
    exaggerated: 45,
    misleading: 70,
    false: 95,
  };

  let baseRisk = classificationRisk[nlpResult.label];

  const phraseRisk = suspiciousPhrases.reduce((acc, p) => {
    const severityScore = { low: 5, medium: 10, high: 15 }[p.severity];
    return acc + severityScore;
  }, 0);

  baseRisk = Math.min(100, baseRisk + Math.min(phraseRisk, 25));

  const inconsistencyPenalty = (100 - similarityResult.consistencyScore) * 0.2;
  baseRisk = Math.min(100, baseRisk + inconsistencyPenalty);

  const companyCredibility = 60;

  const greenwashingRisk = Math.round(
    baseRisk * (1 - companyCredibility * 0.002)
  );

  let riskLevel: RiskLevel = 'low';
  if (greenwashingRisk >= 75) riskLevel = 'critical';
  else if (greenwashingRisk >= 50) riskLevel = 'high';
  else if (greenwashingRisk >= 25) riskLevel = 'medium';

  return {
    greenwashingRisk,
    companyCredibility,
    riskLevel,
  };
}

// ================================
// 🌱 SUSTAINABILITY CHECK (FIXED)
// ================================
function generateSustainabilityCheck(
  nlpResult: { label: ClassificationLabel; confidence: number; reasons: string[] }
) {
  return {
    sdgAlignment: ['SDG 12', 'SDG 13'],
    griCompliance:
      nlpResult.label === 'genuine'
        ? 'compliant'
        : nlpResult.label === 'exaggerated'
        ? 'partial'
        : 'non-compliant',
    esgNotes:
      nlpResult.label === 'genuine'
        ? 'Strong verified claim.'
        : nlpResult.label === 'exaggerated'
        ? 'Overstated sustainability impact.'
        : 'Weak or unclear claim.',
  };
}

// ================================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}