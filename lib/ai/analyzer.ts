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
// 🔥 STRONG TEXT CLEANING (VERY IMPORTANT)
// ================================
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s%]/g, " ")   // remove OCR junk
    .replace(/\s+/g, " ")
    .trim();
}

// ================================
// 🚨 FINAL CLASSIFIER (ORDER MATTERS)
// ================================
function classifyClaimRule(text: string): ClassificationLabel {
  const t = normalizeText(text);

  // ========================
  // ❌ FALSE (HIGHEST PRIORITY)
  // ========================
  if (
    t.includes("without") ||
    t.includes("no ") ||
    t.includes("zero ") ||
    t.includes("no energy") ||
    t.includes("no materials") ||
    t.includes("no resources") ||
    t.includes("no input") ||
    t.includes("no fuel") ||
    t.includes("no battery") ||
    t.includes("without energy") ||
    t.includes("without fuel") ||
    t.includes("without materials") ||
    t.includes("without resources") ||
    t.includes("without water") ||
    t.includes("without soil") ||
    t.includes("without sunlight")
  ) {
    return "false";
  }

  // ========================
  // 🚀 EXAGGERATED
  // ========================
  if (
    t.includes("entire world") ||
    t.includes("whole world") ||
    t.includes("global") ||
    t.includes("all global") ||
    t.includes("everyone") ||
    t.includes("entire population") ||
    t.includes("100 sustainable") ||
    t.includes("100% sustainable") ||
    t.includes("completely sustainable") ||
    t.includes("eliminating all") ||
    t.includes("ending all") ||
    t.includes("transforming the world") ||
    t.includes("revolutionizing") ||
    t.includes("fully sustainable world")
  ) {
    return "exaggerated";
  }

  // ========================
  // ✅ GENUINE
  // ========================
  if (
    (/\d/.test(t) || t.includes("%")) &&
    (t.includes("between") || t.includes("from") || t.includes("during")) &&
    (
      t.includes("verified") ||
      t.includes("certified") ||
      t.includes("iso") ||
      t.includes("standard")
    )
  ) {
    return "genuine";
  }

  // ========================
  // ⚠️ MISLEADING (DEFAULT)
  // ========================
  return "misleading";
}

// ================================
// MAIN FUNCTION
// ================================
export async function analyzeClaimSimulated(
  input: string,
  inputType: InputType,
  company: Company,
  onStepChange: (step: number) => void
): Promise<AnalysisResult> {

  const startTime = Date.now();
  let textToAnalyze = input;

  // Step 1: OCR / Video
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

  // 🔥 CLEAN TEXT BEFORE ANYTHING
  const cleanedText = normalizeText(textToAnalyze);

  // Step 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(cleanedText);

  // 🔥 RULE OVERRIDES NLP (VERY IMPORTANT)
  const ruleLabel = classifyClaimRule(cleanedText);
  nlpResult.label = ruleLabel;

  // Step 3: Similarity
  onStepChange(3);
  await delay(1000);
  const similarityResult = computeSimilarity(
    cleanedText,
    company.historicalClaims
  );

  // Step 4: Suspicious phrases
  onStepChange(4);
  await delay(800);
  const suspiciousPhrases = detectSuspiciousPhrases(cleanedText);

  // Step 5: Risk
  onStepChange(5);
  await delay(600);
  const riskScores = calculateRiskScores(
    nlpResult,
    similarityResult,
    suspiciousPhrases,
    company
  );

  // Step 6: Final
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
// RISK
// ================================
function calculateRiskScores(
  nlpResult: { label: ClassificationLabel; confidence: number; reasons: string[] },
  similarityResult: { consistencyScore: number; similarities: SimilarityResult[]; contradictions: SimilarityResult[] },
  suspiciousPhrases: SuspiciousPhrase[],
  company: Company
) {

  const classificationRisk = {
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

  if (similarityResult.contradictions.length > 0) {
    baseRisk += similarityResult.contradictions.length * 10;
  }

  const verifiedClaimsRatio =
    company.historicalClaims.filter(c => c.verified).length /
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
// ESG
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
    esgNotes:
      nlpResult.label === 'genuine'
        ? 'Strong verified claim'
        : nlpResult.label === 'false'
        ? 'Scientifically impossible claim'
        : 'Needs better clarity',
  };
}

// ================================
function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}