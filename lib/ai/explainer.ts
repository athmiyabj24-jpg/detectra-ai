import type { SuspiciousPhrase } from '../types';

// Pattern definitions for suspicious phrase detection
const SUSPICIOUS_PATTERNS: Array<{
  pattern: RegExp;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}> = [
  // High severity - definite red flags
  {
    pattern: /100%\s*(eco-?friendly|sustainable|green|natural|organic)/gi,
    reason: 'Absolute environmental claim without supporting evidence or certification',
    severity: 'high',
  },
  {
    pattern: /zero\s*(emissions?|carbon|impact|footprint|waste)/gi,
    reason: 'Zero-impact claims are rarely achievable and require rigorous verification',
    severity: 'high',
  },
  {
    pattern: /completely\s*(sustainable|green|eco-?friendly|natural)/gi,
    reason: 'Absolute sustainability claims are typically unsubstantiated',
    severity: 'high',
  },
  {
    pattern: /no\s*environmental\s*impact/gi,
    reason: 'All products and processes have some environmental impact',
    severity: 'high',
  },
  {
    pattern: /carbon\s*neutral(?!\s*(certified|verified|audited))/gi,
    reason: 'Carbon neutrality claim without mentioned verification',
    severity: 'high',
  },

  // Medium severity - potentially misleading
  {
    pattern: /eco-?friendly(?!\s*(certified|verified|according))/gi,
    reason: 'Vague eco-friendly claim without specific criteria or certification',
    severity: 'medium',
  },
  {
    pattern: /(?<!not\s)all\s*natural/gi,
    reason: '"All natural" has no regulatory definition and can be misleading',
    severity: 'medium',
  },
  {
    pattern: /green\s*(product|choice|alternative)(?!\s*(certified|by|standard))/gi,
    reason: 'Unqualified "green" marketing term without substantiation',
    severity: 'medium',
  },
  {
    pattern: /planet-?friendly/gi,
    reason: 'Vague environmental claim with no specific meaning',
    severity: 'medium',
  },
  {
    pattern: /clean\s*(energy|product|formula)(?!\s*\d)/gi,
    reason: '"Clean" lacks standard definition in environmental context',
    severity: 'medium',
  },
  {
    pattern: /sustainable(?!\s*(certified|according|per|under|verified|by))/gi,
    reason: 'Sustainability claim may lack specific criteria or verification',
    severity: 'medium',
  },
  {
    pattern: /environmentally\s*(safe|responsible|conscious)/gi,
    reason: 'Subjective environmental claim without measurable criteria',
    severity: 'medium',
  },
  {
    pattern: /biodegradable(?!\s*(certified|under|within|in\s*\d))/gi,
    reason: 'Biodegradability claims should specify conditions and timeframes',
    severity: 'medium',
  },

  // Low severity - could be improved
  {
    pattern: /aims?\s*to\s*(be|become|achieve)/gi,
    reason: 'Future commitment rather than current achievement',
    severity: 'low',
  },
  {
    pattern: /committed\s*to/gi,
    reason: 'Commitment statement without concrete current actions',
    severity: 'low',
  },
  {
    pattern: /working\s*(towards?|on)/gi,
    reason: 'Aspirational language without measurable progress',
    severity: 'low',
  },
  {
    pattern: /by\s*20[3-9]\d/gi,
    reason: 'Distant future target may deflect from current performance',
    severity: 'low',
  },
  {
    pattern: /better\s*for\s*(the\s*)?(environment|planet|earth)/gi,
    reason: 'Comparative claim without baseline or specific metrics',
    severity: 'low',
  },
  {
    pattern: /less\s*(harmful|impact|waste|pollution)/gi,
    reason: 'Comparative claim should specify baseline and measurement',
    severity: 'low',
  },
];

export function detectSuspiciousPhrases(text: string): SuspiciousPhrase[] {
  const phrases: SuspiciousPhrase[] = [];
  const foundRanges: Array<[number, number]> = [];

  for (const { pattern, reason, severity } of SUSPICIOUS_PATTERNS) {
    let match;
    // Reset regex state
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(text)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      // Check for overlapping ranges
      const isOverlapping = foundRanges.some(
        ([start, end]) =>
          (startIndex >= start && startIndex < end) ||
          (endIndex > start && endIndex <= end)
      );

      if (!isOverlapping) {
        foundRanges.push([startIndex, endIndex]);
        phrases.push({
          text: match[0],
          reason,
          severity,
          startIndex,
          endIndex,
        });
      }
    }
  }

  // Sort by position in text
  phrases.sort((a, b) => a.startIndex - b.startIndex);

  return phrases;
}

// Get explanation for a specific phrase
export function getDetailedExplanation(phrase: SuspiciousPhrase): string {
  const severityDescriptions = {
    high: 'This phrase represents a significant greenwashing red flag that could mislead consumers.',
    medium: 'This phrase uses vague or unsubstantiated environmental language that may not accurately represent the product or company.',
    low: 'This phrase could be improved with more specific information or current achievements rather than future commitments.',
  };

  return `${phrase.reason}\n\n${severityDescriptions[phrase.severity]}`;
}

// Generate recommendations for improving claims
export function generateRecommendations(phrases: SuspiciousPhrase[], isGenuine: boolean = false): string[] {
  const recommendations: string[] = [];
  const addedTypes = new Set<string>();

  // For genuine claims, provide positive reinforcement and minor suggestions
  if (isGenuine || phrases.length === 0) {
    recommendations.push('Excellent use of third-party certifications to validate claims');
    recommendations.push('Continue including specific metrics and timeframes');
    recommendations.push('Consider adding visual progress indicators (charts/infographics) for stakeholder reports');
    if (phrases.length > 0) {
      recommendations.push('Minor refinement: Some phrases could be made even more specific');
    }
    return recommendations;
  }

  // For non-genuine claims, provide improvement suggestions
  for (const phrase of phrases) {
    if (phrase.severity === 'high' && !addedTypes.has('verification')) {
      recommendations.push('Include third-party certifications or verifications for environmental claims');
      addedTypes.add('verification');
    }
    
    if (phrase.text.toLowerCase().includes('%') && !addedTypes.has('metrics')) {
      recommendations.push('Provide specific metrics with baselines and timeframes');
      addedTypes.add('metrics');
    }

    if ((phrase.text.toLowerCase().includes('sustainable') || 
         phrase.text.toLowerCase().includes('eco')) && !addedTypes.has('definition')) {
      recommendations.push('Define what "sustainable" or "eco-friendly" means in your specific context');
      addedTypes.add('definition');
    }

    if (phrase.severity === 'low' && !addedTypes.has('current')) {
      recommendations.push('Highlight current achievements alongside future commitments');
      addedTypes.add('current');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Consider adding independent verification for all environmental claims');
  }

  return recommendations;
}

// Generate positive acknowledgments for genuine claims
export function generatePositiveAcknowledgments(reasons: string[]): string[] {
  const acknowledgments: string[] = [];
  
  for (const reason of reasons) {
    if (reason.toLowerCase().includes('certif')) {
      acknowledgments.push('Strong third-party certification backing');
    }
    if (reason.toLowerCase().includes('metric') || reason.toLowerCase().includes('quantif')) {
      acknowledgments.push('Clear, measurable environmental data');
    }
    if (reason.toLowerCase().includes('timeframe') || reason.toLowerCase().includes('baseline')) {
      acknowledgments.push('Transparent tracking with historical context');
    }
    if (reason.toLowerCase().includes('verified') || reason.toLowerCase().includes('audit')) {
      acknowledgments.push('Independent verification increases trust');
    }
  }

  if (acknowledgments.length === 0) {
    acknowledgments.push('Claim demonstrates good environmental communication practices');
  }

  return [...new Set(acknowledgments)]; // Remove duplicates
}
