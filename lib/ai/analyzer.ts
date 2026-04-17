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
// 🔧 CLEAN OCR TEXT
// ================================
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/5/g, "s")
    .replace(/[^a-z0-9%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ================================
// 🧠 RULE CLASSIFIER (FINAL)
// ================================
function classifyClaimRule(text: string): ClassificationLabel {
  const t = cleanText(text);

  // ❌ FALSE (highest priority)
  if (
    t.includes("without") &&
    (
      t.includes("material") ||
      t.includes("materials") ||
      t.includes("energy") ||
      t.includes("power") ||
      t.includes("fuel") ||
      t.includes("resource") ||
      t.includes("water") ||
      t.includes("soil") ||
      t.includes("sunlight") ||
      t.includes("battery")
    )
  ) {
    return "false";
  }

  // 🚀 EXAGGERATED
  if (
    (t.includes("100") && t.includes("sustainable")) ||
    t.includes("entire world") ||
    t.includes("whole world") ||
    t.includes("global") ||
    t.includes("entire population") ||
    t.includes("eliminating all") ||
    t.includes("ending all") ||
    t.includes("completely sustainable")
  ) {
    return "exaggerated";
  }

  // ✅ GENUINE
  const hasNumber = /\d/.test(t) || t.includes("%");

  const hasTime =
    t.includes("between") ||
    t.includes("from") ||
    t.includes("during");

  const hasVerification =
    t.includes("verified") ||
    t.includes("certified") ||
    t.includes("iso") ||
    t.includes("14001") ||
    t.includes("50001") ||
    t.includes("14064");

  if (hasNumber && (hasTime || hasVerification)) {
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
  let extractedText = input;

  // Step 1: Extract text
  onStepChange(1);
  if (inputType === 'image') {
    await delay(1500);
    extractedText = await extractTextFromImage(input);
  } else if (inputType === 'video') {
    await delay(2000);
    extractedText = await transcribeVideo(input);
  } else {
    await delay(500);
  }

  // 🔥 CLEAN BOTH TEXTS
  const cleanedExtracted = cleanText(extractedText);
  const cleanedOriginal = cleanText(input);

  // 🔥 FALLBACK LOGIC (CRITICAL FIX)
  const finalText =
    cleanedExtracted.length > 20 ? cleanedExtracted : cleanedOriginal;

  // Step 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(finalText);

  // 🔥 RULE OVERRIDE (FINAL FIX)
  const ruleLabel = classifyClaimRule(finalText);
  nlpResult.label = ruleLabel;

  // Step 3: Historical comparison
  onStepChange(3);
  await delay(1000);
  const similarityResult = computeSimilarity(
    finalText,
    company.historicalClaims
  );

  // Step 4: Suspicious phrases
  onStepChange(4);
  await delay(800);
  const suspiciousPhrases = detectSuspiciousPhrases(finalText);

  // Step 5: Risk calculation
  onStepChange(5);
  await delay(600);
  const riskScores = calculateRiskScores(
    nlpResult,
    similarityResult,
    suspiciousPhrases,
    company
  );

  // Step 6: Final result
  onStepChange(6);
  await delay(400);

  const processingTime = Date.now() - startTime;

  return {
    id: `analysis-${Date.now()}`,
    companyId: company.id,
    companyName: company.name,
    inputType,
    originalInput: input,
    extractedText:
      inputType !== 'text' ? extractedText : undefined,
    classification: nlpResult,
    riskScores,
    suspiciousPhrases,
    historicalComparison: similarityResult,
    sustainabilityCheck: generateSustainabilityCheck(
      nlpResult,
      company
    ),
    createdAt: new Date().toISOString(),
    processingTime,
  };
}

// ================================
// 📊 RISK
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

  const inconsistencyPenalty =
    (100 - similarityResult.consistencyScore) * 0.2;

  baseRisk = Math.min(100, baseRisk + inconsistencyPenalty);

  if (similarityResult.contradictions.length > 0) {
    baseRisk = Math.min(
      100,
      baseRisk + similarityResult.contradictions.length * 10
    );
  }

  const verifiedClaimsRatio =
    company.historicalClaims.filter((c) => c.verified).length /
    Math.max(company.historicalClaims.length, 1);

  const certificationBonus =
    company.sustainabilityCertifications.length * 5;

  const companyCredibility = Math.min(
    100,
    Math.round(
      verifiedClaimsRatio * 60 + certificationBonus + 20
    )
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
// 🌱 ESG
// ================================
function generateSustainabilityCheck(
  nlpResult: { label: ClassificationLabel; confidence: number; reasons: string[] },
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
        ? 'Strong verified claim.'
        : nlpResult.label === 'exaggerated'
        ? 'Overstated sustainability impact.'
        : 'Weak or unclear claim.',
  };
}

// ================================
// ⏳ DELAY
// ================================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}