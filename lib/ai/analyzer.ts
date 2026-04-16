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

// ✅ FINAL FIXED RULE-BASED CLASSIFIER
function classifyClaimRule(text: string): ClassificationLabel {
  const t = text.toLowerCase();

  // ❌ FALSE (highest priority)
  if (
    t.includes("without any") ||
    t.includes("no energy") ||
    t.includes("no resources") ||
    t.includes("no materials") ||
    t.includes("no input") ||
    t.includes("instantly")
  ) {
    return "false";
  }

  // 🚀 EXAGGERATED (checked BEFORE genuine)
  if (
    t.includes("global") ||
    t.includes("entire world") ||
    t.includes("entire") ||
    t.includes("transforming") ||
    t.includes("eliminating") ||
    t.includes("revolutionizing") ||
    t.includes("completely") ||
    t.includes("100% sustainable")
  ) {
    return "exaggerated";
  }

  // ✅ GENUINE (numbers + time + verification)
  if (
    (/\d/.test(t) || t.includes("%")) &&
    (t.includes("between") || t.includes("from") || t.includes("during")) &&
    (t.includes("verified") || t.includes("certified") || t.includes("iso"))
  ) {
    return "genuine";
  }

  // ⚠️ MISLEADING (default)
  return "misleading";
}

// Main analysis orchestrator
export async function analyzeClaimSimulated(
  input: string,
  inputType: InputType,
  company: Company,
  onStepChange: (step: number) => void
): Promise<AnalysisResult> {
  const startTime = Date.now();
  let textToAnalyze = input;

  // Step 1: Extract text if needed
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

  // Step 2: NLP
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(textToAnalyze);

  // ✅ RULE OVERRIDE
  const ruleLabel = classifyClaimRule(textToAnalyze);
  nlpResult.label = ruleLabel;

  // Step 3: Historical
  onStepChange(3);
  await delay(1000);
  const similarityResult = computeSimilarity(textToAnalyze, company.historicalClaims);

  // Step 4: Suspicious phrases
  onStepChange(4);
  await delay(800);
  const suspiciousPhrases = detectSuspiciousPhrases(textToAnalyze);

  // Step 5: Risk
  onStepChange(5);
  await delay(600);
  const riskScores = calculateRiskScores(
    nlpResult,
    similarityResult,
    suspiciousPhrases,
    company
  );

  // Step 6: Result
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

  const certificationBonus = company.sustainabilityCertifications.length * 5;

  const companyCredibility = Math.min(
    100,
    Math.round((verifiedClaimsRatio * 60) + certificationBonus + 20)
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

function generateSustainabilityCheck(
  nlpResult: { label: ClassificationLabel; confidence: number; reasons: string[] },
  company: Company
) {
  const possibleSDGs = [
    'SDG 7: Clean Energy',
    'SDG 12: Responsible Consumption',
    'SDG 13: Climate Action',
  ];

  const sdgAlignment = possibleSDGs.slice(0, 2);

  let griCompliance: 'compliant' | 'partial' | 'non-compliant' = 'non-compliant';

  if (nlpResult.label === 'genuine') griCompliance = 'compliant';
  else if (nlpResult.label === 'exaggerated') griCompliance = 'partial';

  const esgNotes =
    nlpResult.label === 'genuine'
      ? 'Strong verified claim.'
      : nlpResult.label === 'exaggerated'
      ? 'Overstated sustainability impact.'
      : 'Weak or unclear claim.';

  return { sdgAlignment, griCompliance, esgNotes };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}