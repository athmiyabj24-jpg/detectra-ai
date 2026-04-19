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
// 🔥 CLEAN TEXT (BUT KEEP WORDS)
// ================================
function clean(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ================================
// 🔥 FUZZY MATCH (handles OCR errors)
// ================================
function fuzzyIncludes(text: string, keyword: string): boolean {
  const words = text.split(" ");
  return words.some(w => w.includes(keyword) || keyword.includes(w));
}

// ================================
// 🔥 FINAL CLASSIFIER (ROBUST)
// ================================
function classifyClaimRule(text: string): ClassificationLabel {
  const raw = text.toLowerCase();
  const t = clean(text);

  // ======================
  // ❌ FALSE (TOP PRIORITY)
  // ======================
  if (
    fuzzyIncludes(t, "without") ||
    fuzzyIncludes(t, "no energy") ||
    fuzzyIncludes(t, "no material") ||
    fuzzyIncludes(t, "no resource") ||
    fuzzyIncludes(t, "no fuel") ||
    fuzzyIncludes(t, "no power") ||
    fuzzyIncludes(t, "no input") ||
    fuzzyIncludes(t, "no battery")
  ) {
    return "false";
  }

  // ======================
  // 🚀 EXAGGERATED
  // ======================
  if (
    fuzzyIncludes(t, "100") ||
    fuzzyIncludes(t, "world") ||
    fuzzyIncludes(t, "global") ||
    fuzzyIncludes(t, "entire") ||
    fuzzyIncludes(t, "everyone") ||
    fuzzyIncludes(t, "completely") ||
    fuzzyIncludes(t, "eliminating") ||
    fuzzyIncludes(t, "ending")
  ) {
    return "exaggerated";
  }

  // ======================
  // ✅ GENUINE
  // ======================
  if (
    (/\d/.test(t) || t.includes("%")) &&
    (t.includes("between") || t.includes("from") || t.includes("during")) &&
    (
      fuzzyIncludes(t, "iso") ||
      fuzzyIncludes(t, "verified") ||
      fuzzyIncludes(t, "certified")
    )
  ) {
    return "genuine";
  }

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

  // 🔥 KEEP BOTH RAW + CLEAN
  const cleanedText = clean(textToAnalyze);

  // STEP 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(cleanedText);

  // 🔥 RULE OVERRIDE (CRITICAL)
  const finalLabel = classifyClaimRule(textToAnalyze);
  nlpResult.label = finalLabel;

  // STEP 3
  onStepChange(3);
  await delay(1000);
  const similarityResult = computeSimilarity(
    cleanedText,
    company.historicalClaims
  );

  // STEP 4
  onStepChange(4);
  await delay(800);
  const suspiciousPhrases = detectSuspiciousPhrases(cleanedText);

  // STEP 5
  onStepChange(5);
  await delay(600);
  const riskScores = calculateRiskScores(
    nlpResult,
    similarityResult,
    suspiciousPhrases,
    company
  );

  // STEP 6
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
// 📊 RISK
// ================================
function calculateRiskScores(
  nlpResult: { label: ClassificationLabel },
  similarityResult: any,
  suspiciousPhrases: SuspiciousPhrase[],
  company: Company
) {
  const map = {
    genuine: 10,
    exaggerated: 45,
    misleading: 70,
    false: 95,
  };

  const base = map[nlpResult.label];

  let level: RiskLevel = "low";
  if (base >= 75) level = "critical";
  else if (base >= 50) level = "high";
  else if (base >= 25) level = "medium";

  return {
    greenwashingRisk: base,
    companyCredibility: 70,
    riskLevel: level,
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
    esgNotes: `Detected as ${nlpResult.label}`,
  };
}

// ================================
function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}