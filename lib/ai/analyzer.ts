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
// 🔥 CLEAN TEXT (OCR FIX)
// ================================
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ================================
// 🔥 FINAL CLASSIFIER (FUZZY + STRONG)
// ================================
function classifyClaimRule(text: string): ClassificationLabel {
  const t = cleanText(text);

  // ====================
  // ❌ FALSE (TOP PRIORITY)
  // ====================
  if (
    t.includes("without") ||
    (
      t.includes("no") &&
      (
        t.includes("material") ||
        t.includes("energy") ||
        t.includes("resource") ||
        t.includes("fuel") ||
        t.includes("power")
      )
    )
  ) {
    return "false";
  }

  // ====================
  // 🚀 EXAGGERATED (FUZZY)
  // ====================
  if (
    t.includes("100") ||
    t.includes("entire") ||
    t.includes("world") ||
    t.includes("global") ||
    t.includes("completely") ||
    t.includes("all") ||
    t.includes("eliminating") ||
    t.includes("ending")
  ) {
    return "exaggerated";
  }

  // ====================
  // ✅ GENUINE
  // ====================
  if (
    (/\d/.test(t) || t.includes("%")) &&
    (t.includes("between") || t.includes("from") || t.includes("during")) &&
    (t.includes("iso") || t.includes("verified") || t.includes("certified"))
  ) {
    return "genuine";
  }

  // ====================
  // ⚠️ DEFAULT
  // ====================
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

  // Step 1: Extract text
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

  // 🔥 CLEAN TEXT (IMPORTANT)
  const cleanedText = cleanText(textToAnalyze);

  // Step 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(cleanedText);

  // 🔥 FORCE FINAL LABEL (RULE OVERRIDES NLP)
  const finalLabel = classifyClaimRule(cleanedText);
  nlpResult.label = finalLabel;

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

  // Step 5: Risk calculation
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
    sustainabilityCheck: generateSustainabilityCheck(nlpResult),
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
): { greenwashingRisk: number; companyCredibility: number; riskLevel: RiskLevel } {

  const classificationRisk: Record<ClassificationLabel, number> = {
    genuine: 10,
    exaggerated: 45,
    misleading: 70,
    false: 95,
  };

  const baseRisk = classificationRisk[nlpResult.label];

  let riskLevel: RiskLevel = 'low';
  if (baseRisk >= 75) riskLevel = 'critical';
  else if (baseRisk >= 50) riskLevel = 'high';
  else if (baseRisk >= 25) riskLevel = 'medium';

  return {
    greenwashingRisk: baseRisk,
    companyCredibility: 70,
    riskLevel,
  };
}

// ================================
// 🌱 ESG CHECK
// ================================
function generateSustainabilityCheck(nlpResult: { label: ClassificationLabel }) {
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
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}