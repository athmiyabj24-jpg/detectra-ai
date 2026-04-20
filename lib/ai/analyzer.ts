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
// 🔧 TEXT NORMALIZATION (OCR FIX)
// ================================
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ================================
// 🔥 FINAL CLASSIFIER (WORKING)
// ================================
function classifyClaimRule(text: string): ClassificationLabel {
  const t = normalize(text);

  // ======================
  // ❌ FALSE (FIRST PRIORITY)
  // ======================
  if (
    t.includes("without") ||
    t.includes("no energy") ||
    t.includes("no fuel") ||
    t.includes("no materials") ||
    t.includes("no resources") ||
    t.includes("no battery") ||
    t.includes("no water") ||
    t.includes("no soil") ||
    t.includes("no sunlight")
  ) {
    return "false";
  }

  // ======================
  // 🚀 EXAGGERATED
  // ======================
  if (
    t.includes("100") ||
    t.includes("entire world") ||
    t.includes("global") ||
    t.includes("everyone") ||
    t.includes("completely") ||
    t.includes("eliminating") ||
    t.includes("ending")
  ) {
    return "exaggerated";
  }

  // ======================
  // ✅ GENUINE (OCR-TOLERANT)
  // ======================
  const hasPercent = /[0-9]{1,3}\s?%/.test(t);
  const hasYear = /20[0-9]{2}/.test(t);

  const hasProof =
    t.includes("iso") ||
    t.includes("fsc") ||
    t.includes("rainforest") ||
    /verif/.test(t) ||
    /certif/.test(t);

  const hasImpact =
    t.includes("reduced") ||
    t.includes("reduction") ||
    t.includes("improved") ||
    t.includes("efficiency") ||
    t.includes("sourced");

  if (hasPercent && hasYear && hasImpact) {
    return "genuine";
  }

  // ======================
  // ⚠️ MISLEADING
  // ======================
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

  // DEBUG (optional)
  console.log("OCR TEXT:", textToAnalyze);

  // STEP 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(textToAnalyze);

  // 🔥 FINAL LABEL (OVERRIDE EVERYTHING)
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
    extractedText: inputType !== 'text' ? textToAnalyze : undefined,
    classification: nlpResult,
    riskScores,
    suspiciousPhrases,
    historicalComparison: similarityResult,
    sustainabilityCheck: generateSustainabilityCheck(nlpResult, company),
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

  if (similarityResult.contradictions.length > 0) {
    baseRisk = Math.min(100, baseRisk + similarityResult.contradictions.length * 10);
  }

  const verifiedClaimsRatio =
    company.historicalClaims.filter((c) => c.verified).length /
    Math.max(company.historicalClaims.length, 1);

  const certificationBonus =
    company.sustainabilityCertifications.length * 5;

  const companyCredibility = Math.min(
    100,
    Math.round(verifiedClaimsRatio * 60 + certificationBonus + 20)
  );

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
// 🌱 SUSTAINABILITY CHECK
// ================================
function generateSustainabilityCheck(
  nlpResult: { label: ClassificationLabel; confidence: number; reasons: string[] },
  company: Company
) {
  const sdgAlignment = [
    'SDG 7: Clean Energy',
    'SDG 12: Responsible Consumption'
  ];

  let griCompliance: 'compliant' | 'partial' | 'non-compliant' = 'non-compliant';

  if (nlpResult.label === 'genuine') griCompliance = 'compliant';
  else if (nlpResult.label === 'exaggerated') griCompliance = 'partial';

  const esgNotes =
    nlpResult.label === 'genuine'
      ? 'Strong verified claim.'
      : nlpResult.label === 'exaggerated'
      ? 'Overstated sustainability impact.'
      : nlpResult.label === 'false'
      ? 'Scientifically impossible claim detected.'
      : 'Vague or unclear sustainability statement.';

  return { sdgAlignment, griCompliance, esgNotes };
}

// ================================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}