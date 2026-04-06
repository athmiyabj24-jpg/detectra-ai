import type { HistoricalClaim, SimilarityResult } from '../types';

// Simulated semantic similarity computation
export function computeSimilarity(
  currentClaim: string,
  historicalClaims: HistoricalClaim[]
): {
  consistencyScore: number;
  similarities: SimilarityResult[];
  contradictions: SimilarityResult[];
} {
  if (historicalClaims.length === 0) {
    return {
      consistencyScore: 50, // Neutral when no history
      similarities: [],
      contradictions: [],
    };
  }

  const currentLower = currentClaim.toLowerCase();
  const currentKeywords = extractKeywords(currentLower);

  const similarities: SimilarityResult[] = [];
  const contradictions: SimilarityResult[] = [];

  for (const claim of historicalClaims) {
    const claimLower = claim.text.toLowerCase();
    const claimKeywords = extractKeywords(claimLower);

    // Compute Jaccard-like similarity based on keywords
    const intersection = currentKeywords.filter((kw) => claimKeywords.includes(kw));
    const union = new Set([...currentKeywords, ...claimKeywords]);
    const similarity = intersection.length / union.size;

    // Add some noise for realism
    const adjustedSimilarity = Math.min(1, similarity + (Math.random() * 0.2 - 0.1));

    // Check for contradictions
    const contradictionPairs = [
      ['100%', 'partial'],
      ['zero', 'some'],
      ['completely', 'mostly'],
      ['carbon neutral', 'emissions'],
      ['plastic-free', 'plastic'],
      ['organic', 'synthetic'],
    ];

    let isContradiction = false;
    let contradictionReason = '';

    for (const [term1, term2] of contradictionPairs) {
      if (
        (currentLower.includes(term1) && claimLower.includes(term2)) ||
        (currentLower.includes(term2) && claimLower.includes(term1))
      ) {
        isContradiction = true;
        contradictionReason = `Current claim uses "${term1}" while historical claim references "${term2}"`;
        break;
      }
    }

    // Also check for conflicting percentages
    const currentPercentages = currentLower.match(/(\d+)%/g) || [];
    const historicalPercentages = claimLower.match(/(\d+)%/g) || [];
    
    if (currentPercentages.length > 0 && historicalPercentages.length > 0) {
      const currentNums = currentPercentages.map((p) => parseInt(p));
      const historicalNums = historicalPercentages.map((p) => parseInt(p));
      
      // Check if talking about same topic with very different numbers
      if (hasSimilarTopic(currentLower, claimLower)) {
        const maxCurrent = Math.max(...currentNums);
        const maxHistorical = Math.max(...historicalNums);
        if (Math.abs(maxCurrent - maxHistorical) > 30) {
          isContradiction = true;
          contradictionReason = `Significant discrepancy in claimed percentages (${maxCurrent}% vs ${maxHistorical}%)`;
        }
      }
    }

    const result: SimilarityResult = {
      claimId: claim.id,
      claimText: claim.text,
      similarity: Math.round(adjustedSimilarity * 100) / 100,
      isContradiction,
      contradictionReason: isContradiction ? contradictionReason : undefined,
    };

    if (isContradiction) {
      contradictions.push(result);
    } else if (adjustedSimilarity > 0.3) {
      similarities.push(result);
    }
  }

  // Sort by similarity
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Calculate consistency score
  let consistencyScore = 70; // Base score

  // Boost for similar claims
  if (similarities.length > 0) {
    const avgSimilarity = similarities.reduce((acc, s) => acc + s.similarity, 0) / similarities.length;
    consistencyScore += avgSimilarity * 20;
  }

  // Penalty for contradictions
  consistencyScore -= contradictions.length * 15;

  // Bonus for verified historical claims
  const verifiedCount = historicalClaims.filter((c) => c.verified).length;
  consistencyScore += (verifiedCount / historicalClaims.length) * 10;

  consistencyScore = Math.max(0, Math.min(100, Math.round(consistencyScore)));

  return {
    consistencyScore,
    similarities: similarities.slice(0, 5),
    contradictions,
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
    'that', 'these', 'those', 'it', 'its', 'our', 'we', 'us', 'your',
    'you', 'their', 'they', 'them', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very',
  ]);

  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)];
}

function hasSimilarTopic(text1: string, text2: string): boolean {
  const topics = [
    ['emission', 'carbon', 'co2', 'greenhouse'],
    ['energy', 'renewable', 'solar', 'wind', 'power'],
    ['water', 'usage', 'consumption'],
    ['waste', 'recycl', 'packaging'],
    ['organic', 'natural', 'chemical'],
  ];

  for (const topicWords of topics) {
    const text1HasTopic = topicWords.some((w) => text1.includes(w));
    const text2HasTopic = topicWords.some((w) => text2.includes(w));
    if (text1HasTopic && text2HasTopic) {
      return true;
    }
  }

  return false;
}
