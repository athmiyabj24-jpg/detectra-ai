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
// 🔥 TEXT NORMALIZATION (CRITICAL)
// ================================
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ================================
// 🔥 CLASSIFIER (FINAL FIX)
// ================================
function classifyClaimRule(text: string): ClassificationLabel {
  const raw = text.toLowerCase();
  const t = normalize(text);

  // ======================
  // ❌ FALSE (STRICT + FIRST)
  // ======================
  if (
    t.includes("without") ||
    t.includes("no energy") ||
    t.includes("no fuel") ||
    t.includes("no materials") ||
    t.includes("no resources") ||
    t.includes("no battery")
  ) {
    return "false";
  }

  // ======================
  // 🚀 EXAGGERATED
  // ======================
  if (
    t.includes("100") ||
    t.includes("entire world") ||
    t.includes("whole world") ||
    t.includes("global") ||
    t.includes("everyone") ||
    t.includes("completely") ||
    t.includes("eliminating") ||
    t.includes("ending")
  ) {
    return "exaggerated";
  }

  // ======================
  // ✅ GENUINE (ROBUST)
  // ======================
  const hasNumber = /\d/.test(raw) || t.includes("%");
  const hasYear = /20\d{2}/.test(raw) || t.includes("202") || t.includes("203");

  const hasProof =
    t.includes("iso") ||
    t.includes("lso") ||         // OCR mistake
    t.includes("verified") ||
    t.includes("verifed") ||
    t.includes("certified") ||
    t.includes("certifed");

  if (hasNumber && (hasYear || hasProof)) {
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

  // STEP 1: OCR / VIDEO
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

  // 🔥 Normalize AFTER extraction
  const normalizedText = normalize(textToAnalyze);

  // STEP 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(normalizedText);

  // 🔥 FINAL CLASSIFICATION
  const finalLabel = classifyClaimRule(textToAnalyze);
  nlpResult.label = finalLabel;

  // STEP 3: Similarity
  onStepChange(3);
  await delay(1000);
  const similarityResult = computeSimilarity(
    normalizedText,
    company.historicalClaims
  );

  // STEP 4: Suspicious phrases
  onStepChange(4);
  await delay(800);
  const suspiciousPhrases = detectSuspiciousPhrases(normalizedText);

  // STEP 5: Risk
  onStepChange(5);
  await delay(600);
  const riskScores = calculateRiskScores(
    nlpResult,
    similarityResult,
    suspiciousPhrases,
    company
  );

  // STEP 6: Final
  onStepChange(6);
  await delay(400);

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
    sustainabilityCheck: generateSustainabilityCheck(nlpResult, company),
    createdAt: new Date().toISOString(),
    processingTime: Date.now() - startTime,
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
) {

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

  const inconsistencyPenalty =
    (100 - similarityResult.consistencyScore) * 0.2;

  baseRisk = Math.min(100, baseRisk + inconsistencyPenalty);

  const companyCredibility = 70;

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
  nlpResult: { label: ClassificationLabel },
  company: Company
) {
  return {
    sdgAlignment: ['SDG 12', 'SDG 13'],
    griCompliance:
      nlpResult.label === 'genuine'
        ? 'compliant'
        : nlpResult.label === 'exaggerated'
        ? 'partial'
        : 'non-compliant',
    esgNotes: `Detected as ${nlpResult.label}`,
  };
}

// ================================
function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}