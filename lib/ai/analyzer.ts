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

// Main analysis orchestrator
export async function analyzeClaimSimulated(
  input: string,
  inputType: InputType,
  company: Company,
  onStepChange: (step: number) => void
): Promise<AnalysisResult> {
  const startTime = Date.now();
  let textToAnalyze = input;

  // Step 1: Extract text if needed (OCR/Video)
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

  // Step 2: NLP Classification
  onStepChange(2);
  await delay(1200);
  const nlpResult = analyzeNLP(textToAnalyze);

  // Step 3: Historical Comparison
  onStepChange(3);
  await delay(1000);
  const similarityResult = computeSimilarity(textToAnalyze, company.historicalClaims);

  // Step 4: Suspicious Phrase Detection
  onStepChange(4);
  await delay(800);
  const suspiciousPhrases = detectSuspiciousPhrases(textToAnalyze);

  // Step 5: Risk Calculation
  onStepChange(5);
  await delay(600);
  const riskScores = calculateRiskScores(
    nlpResult,
    similarityResult,
    suspiciousPhrases,
    company
  );

  // Step 6: Generate Result
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
  // Base risk from classification
  const classificationRisk: Record<ClassificationLabel, number> = {
    genuine: 10,
    exaggerated: 45,
    misleading: 70,
    false: 95,
  };
  let baseRisk = classificationRisk[nlpResult.label];

  // Adjust for suspicious phrases
  const phraseRisk = suspiciousPhrases.reduce((acc, p) => {
    const severityScore = { low: 5, medium: 10, high: 15 }[p.severity];
    return acc + severityScore;
  }, 0);
  baseRisk = Math.min(100, baseRisk + Math.min(phraseRisk, 25));

  // Adjust for historical inconsistency
  const inconsistencyPenalty = (100 - similarityResult.consistencyScore) * 0.2;
  baseRisk = Math.min(100, baseRisk + inconsistencyPenalty);

  // Contradictions add significant risk
  if (similarityResult.contradictions.length > 0) {
    baseRisk = Math.min(100, baseRisk + similarityResult.contradictions.length * 10);
  }

  // Company credibility based on certifications and verified claims
  const verifiedClaimsRatio = company.historicalClaims.filter((c) => c.verified).length / 
    Math.max(company.historicalClaims.length, 1);
  const certificationBonus = company.sustainabilityCertifications.length * 5;
  const companyCredibility = Math.min(100, Math.round(
    (verifiedClaimsRatio * 60) + certificationBonus + 20
  ));

  // Final risk adjusted by credibility
  const greenwashingRisk = Math.round(baseRisk * (1 - companyCredibility * 0.002));

  // Determine risk level
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
): { sdgAlignment: string[]; griCompliance: 'compliant' | 'partial' | 'non-compliant'; esgNotes: string } {
  // SDG alignment based on claim content and company certifications
  const possibleSDGs = [
    'SDG 7: Affordable and Clean Energy',
    'SDG 12: Responsible Consumption',
    'SDG 13: Climate Action',
    'SDG 14: Life Below Water',
    'SDG 15: Life on Land',
  ];

  const sdgAlignment = possibleSDGs.filter(() => Math.random() > 0.5).slice(0, 3);
  if (sdgAlignment.length === 0) {
    sdgAlignment.push('SDG 12: Responsible Consumption');
  }

  // GRI compliance based on classification
  let griCompliance: 'compliant' | 'partial' | 'non-compliant' = 'non-compliant';
  if (nlpResult.label === 'genuine') {
    griCompliance = company.sustainabilityCertifications.length > 0 ? 'compliant' : 'partial';
  } else if (nlpResult.label === 'exaggerated') {
    griCompliance = 'partial';
  }

  // ESG notes
  const esgNotes = nlpResult.label === 'genuine'
    ? 'Claim appears to align with ESG reporting standards. Specific metrics and third-party verification strengthen credibility.'
    : nlpResult.label === 'exaggerated'
    ? 'Claim contains some accurate elements but lacks the specificity required for ESG compliance. Consider adding quantifiable metrics.'
    : 'Claim does not meet ESG disclosure requirements. Vague language and lack of verification are significant concerns.';

  return { sdgAlignment, griCompliance, esgNotes };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
