import type { ClassificationLabel } from '../types';

// Simulated NLP analysis using rule-based classification
export function analyzeNLP(text: string): {
  label: ClassificationLabel;
  confidence: number;
  reasons: string[];
} {
  const lowerText = text.toLowerCase();
  const positiveReasons: string[] = [];
  const negativeReasons: string[] = [];
  let score = 0; // Higher score = more likely to be greenwashing (positive = bad, negative = good)

  // ============== POSITIVE INDICATORS (genuine claim markers) ==============
  
  // Strong third-party verification and certifications
  const certifications = [
    { pattern: /\bISO\s*14001\b/i, name: 'ISO 14001 Environmental Management' },
    { pattern: /\bISO\s*50001\b/i, name: 'ISO 50001 Energy Management' },
    { pattern: /\bB\s*Corp\b/i, name: 'B Corporation Certified' },
    { pattern: /\bFSC\s*certified\b/i, name: 'FSC Certified' },
    { pattern: /\bUSDA\s*Organic\b/i, name: 'USDA Organic Certified' },
    { pattern: /\bFair\s*Trade\s*certified\b/i, name: 'Fair Trade Certified' },
    { pattern: /\bLEED\s*(certified|platinum|gold|silver)\b/i, name: 'LEED Certified' },
    { pattern: /\bEnergy\s*Star\b/i, name: 'Energy Star Certified' },
    { pattern: /\bCradle\s*to\s*Cradle\b/i, name: 'Cradle to Cradle Certified' },
    { pattern: /\bSCI(?:ence)?\s*Based\s*Targets?\b/i, name: 'Science Based Targets initiative' },
    { pattern: /\bGRI\s*(?:Standards?|compliant)\b/i, name: 'GRI Standards Compliant' },
    { pattern: /\bCDP\s*(?:A|A-|B|B-)?\s*(?:rating|score|list)?\b/i, name: 'CDP Disclosure' },
    { pattern: /\bRainforest\s*Alliance\b/i, name: 'Rainforest Alliance Certified' },
    { pattern: /\bcarbon\s*trust\b/i, name: 'Carbon Trust Certified' },
  ];
  
  const foundCertifications = certifications.filter(cert => cert.pattern.test(text));
  if (foundCertifications.length > 0) {
    score -= foundCertifications.length * 25;
    positiveReasons.push(`Third-party certifications: ${foundCertifications.map(c => c.name).join(', ')}`);
  }

  // General verification language
  if (/independently\s*(verified|audited|assessed)/i.test(text)) {
    score -= 20;
    positiveReasons.push('Claims are independently verified');
  }
  
  if (/third-party\s*(audit|verification|assessment|certified)/i.test(text)) {
    score -= 20;
    positiveReasons.push('Third-party audit or verification mentioned');
  }

  // Specific quantifiable metrics with proper context
  const metricsPatterns = [
    { pattern: /\d+(?:\.\d+)?%\s*(?:reduction|decrease|cut|lower)/i, reason: 'Quantified reduction percentage' },
    { pattern: /\d+(?:\.\d+)?%\s*(?:renewable|recycled|recyclable)/i, reason: 'Quantified renewable/recycled content' },
    { pattern: /reduced\s*(?:by\s*)?\d+(?:\.\d+)?%/i, reason: 'Specific reduction metric provided' },
    { pattern: /\d+(?:,\d{3})*\s*(?:tons?|tonnes?|metric\s*tons?)\s*(?:of\s*)?(?:CO2|carbon|emissions?)/i, reason: 'Specific tonnage of emissions data' },
    { pattern: /\d+(?:,\d{3})*\s*(?:MWh|GWh|kWh)\s*(?:of\s*)?(?:renewable|clean|solar|wind)/i, reason: 'Specific energy consumption data' },
    { pattern: /\d+(?:,\d{3})*\s*(?:gallons?|liters?|m3)\s*(?:of\s*)?water\s*(?:saved|conserved|reduced)/i, reason: 'Quantified water conservation' },
    { pattern: /\d+(?:,\d{3})*\s*(?:trees?|acres?|hectares?)\s*(?:planted|preserved|protected)/i, reason: 'Quantified reforestation/conservation efforts' },
  ];

  const foundMetrics = metricsPatterns.filter(m => m.pattern.test(text));
  if (foundMetrics.length > 0) {
    score -= foundMetrics.length * 15;
    foundMetrics.forEach(m => positiveReasons.push(m.reason));
  }

  // Specific timeframes and baselines
  if (/(?:since|from|in)\s*\d{4}\s*(?:to|through|until)?\s*\d{0,4}/i.test(text)) {
    score -= 12;
    positiveReasons.push('Specific timeframe provided for claims');
  }
  
  if (/compared\s*to\s*(?:a\s*)?\d{4}\s*baseline/i.test(text)) {
    score -= 15;
    positiveReasons.push('Uses specific baseline year for comparison');
  }

  if (/year[- ]over[- ]year|yoy|annually/i.test(text)) {
    score -= 8;
    positiveReasons.push('Demonstrates ongoing tracking and improvement');
  }

  // Methodology transparency
  if (/methodology|calculated\s*(?:using|based\s*on)|scope\s*[123]/i.test(text)) {
    score -= 12;
    positiveReasons.push('Transparent methodology or scope mentioned');
  }

  // Verified achievements (past tense, accomplished)
  if (/(?:have|has)\s*(?:achieved|reached|attained|accomplished)/i.test(text)) {
    score -= 10;
    positiveReasons.push('References verified achievements');
  }

  // ============== NEGATIVE INDICATORS (greenwashing markers) ==============

  // Check for vague environmental terms without supporting evidence
  const vagueTerms = [
    'eco-friendly',
    'green',
    'natural',
    'earth-friendly',
    'planet-friendly',
    'clean',
    'pure',
  ];
  const foundVague = vagueTerms.filter((term) => lowerText.includes(term));
  
  // Vague terms are only penalized if NOT accompanied by certifications or metrics
  if (foundVague.length > 0 && foundCertifications.length === 0 && foundMetrics.length === 0) {
    score += foundVague.length * 12;
    negativeReasons.push(`Uses vague terms without supporting evidence: ${foundVague.slice(0, 3).join(', ')}`);
  }

  // Check for absolute claims without verification
  const absoluteTerms = ['100%', 'completely', 'totally', 'fully', 'entirely', 'no impact'];
  const foundAbsolute = absoluteTerms.filter((term) => lowerText.includes(term));
  
  // Absolute claims are acceptable IF accompanied by certification
  if (foundAbsolute.length > 0 && foundCertifications.length === 0) {
    const hasVerification = /certified|verified|audited|third-party|independently/i.test(text);
    if (!hasVerification) {
      score += foundAbsolute.length * 18;
      negativeReasons.push(`Absolute claims without verification: ${foundAbsolute.join(', ')}`);
    }
  }

  // Zero/carbon neutral claims need specific handling
  if (/zero\s*(emissions?|carbon|waste)/i.test(text) || /carbon\s*neutral/i.test(text) || /net[- ]?zero/i.test(text)) {
    const hasStrongVerification = /certified|verified|offset|scope\s*[123]|protocol|standard/i.test(text);
    if (!hasStrongVerification) {
      score += 25;
      negativeReasons.push('Zero/carbon neutral claims require strong verification');
    } else {
      score -= 10; // Verified carbon claims are actually good
      positiveReasons.push('Carbon neutrality claim with supporting verification');
    }
  }

  // Future commitments vs current state
  const futureTerms = ['will be', 'aims to', 'committed to', 'goal', 'target', 'aspire'];
  const foundFuture = futureTerms.filter((term) => lowerText.includes(term));
  const distantFuture = /by\s*20[4-9]\d/i.test(text); // 2040 or later
  
  if (foundFuture.length > 0) {
    // Future commitments are okay if they also include current progress
    const hasCurrentProgress = /(?:already|currently|have\s*(?:achieved|reduced)|to\s*date)/i.test(text);
    if (!hasCurrentProgress && distantFuture) {
      score += 15;
      negativeReasons.push('Distant future commitments without current progress');
    } else if (foundFuture.length > 0 && !hasCurrentProgress) {
      score += 8;
      negativeReasons.push('Contains future commitments - current achievements would strengthen claim');
    }
  }

  // Hidden trade-offs or selective disclosure
  if (/one\s*of\s*(?:the\s*)?(?:most|leading|first)/i.test(text) && foundCertifications.length === 0) {
    score += 8;
    negativeReasons.push('Comparative leadership claim without third-party validation');
  }

  // ============== FINAL SCORE CALCULATION ==============
  
  // Base score starts at 35 (neutral-ish, slight skepticism)
  score = Math.max(0, Math.min(100, score + 35));

  // Determine classification with better thresholds for genuine claims
  let label: ClassificationLabel;
  let confidence: number;

  if (score < 20) {
    label = 'genuine';
    confidence = 0.85 + (20 - score) / 200; // Higher confidence for very good claims
  } else if (score < 35) {
    label = 'genuine';
    confidence = 0.72 + (35 - score) / 150;
  } else if (score < 50) {
    label = 'exaggerated';
    confidence = 0.65 + Math.abs(42.5 - score) / 75;
  } else if (score < 70) {
    label = 'misleading';
    confidence = 0.68 + Math.abs(60 - score) / 100;
  } else {
    label = 'false';
    confidence = 0.75 + (score - 70) / 120;
  }

  confidence = Math.min(0.96, Math.max(0.58, confidence));

  // Build final reasons list - positive first for genuine, negative first for others
  let reasons: string[] = [];
  if (label === 'genuine') {
    reasons = [...positiveReasons];
    if (negativeReasons.length > 0) {
      reasons.push('Minor improvement opportunities: ' + negativeReasons.join('; '));
    }
  } else {
    reasons = [...negativeReasons, ...positiveReasons];
  }

  // Ensure we have at least one reason
  if (reasons.length === 0) {
    if (label === 'genuine') {
      reasons.push('Claim uses appropriate environmental language with reasonable specificity');
    } else {
      reasons.push('Claim could benefit from more specific metrics and third-party verification');
    }
  }

  return {
    label,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
  };
}
