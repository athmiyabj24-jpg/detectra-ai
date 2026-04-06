'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  History,
  Shield,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import type { AnalysisResult, SuspiciousPhrase } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { generateRecommendations, generatePositiveAcknowledgments } from '@/lib/ai/explainer';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export function AnalysisResults({ result, onNewAnalysis }: AnalysisResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    suspicious: true,
    historical: true,
    sustainability: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const classificationColors: Record<string, string> = {
    genuine: 'bg-green-500',
    misleading: 'bg-amber-500',
    exaggerated: 'bg-orange-500',
    false: 'bg-red-500',
  };

  const riskColors: Record<string, string> = {
    low: 'text-green-500',
    medium: 'text-amber-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };

  const isGenuine = result.classification.label === 'genuine';
  const recommendations = generateRecommendations(result.suspiciousPhrases, isGenuine);
  const positiveAcknowledgments = isGenuine ? generatePositiveAcknowledgments(result.classification.reasons) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onNewAnalysis}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground">
              Analyzed {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button onClick={onNewAnalysis}>Analyze Another Claim</Button>
      </div>

      {/* Summary Card */}
      <Card className={`border-2 ${isGenuine ? 'border-green-500/50 bg-green-500/5' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  classificationColors[result.classification.label]
                }`}
              >
                {result.classification.label === 'genuine' ? (
                  <CheckCircle className="h-8 w-8 text-white" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classification</p>
                <p className="text-2xl font-bold capitalize">
                  {isGenuine ? 'Verified Genuine' : result.classification.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(result.classification.confidence * 100)}% confidence
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              <div className="text-center">
                <p className={`text-3xl font-bold ${isGenuine ? 'text-green-500' : riskColors[result.riskScores.riskLevel]}`}>
                  {isGenuine ? 'Low' : result.riskScores.greenwashingRisk}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isGenuine ? 'Greenwashing Risk' : 'Risk Score'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{result.riskScores.companyCredibility}</p>
                <p className="text-sm text-muted-foreground">Company Credibility</p>
              </div>
              <div className="text-center">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-sm ${
                    isGenuine ? 'text-green-500 border-green-500/50 bg-green-500/10' : `${riskColors[result.riskScores.riskLevel]} border-current`
                  }`}
                >
                  {isGenuine ? 'VERIFIED CLAIM' : `${result.riskScores.riskLevel.toUpperCase()} RISK`}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Positive acknowledgment banner for genuine claims */}
          {isGenuine && (
            <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-500">Claim Verification Passed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This environmental claim demonstrates strong supporting evidence, appropriate specificity, 
                and follows best practices for sustainability communication.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phrases">Suspicious Phrases</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
          <TabsTrigger value="sustainability">Standards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Original Claim */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analyzed Claim
              </CardTitle>
              <CardDescription>{result.companyName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm">{result.originalInput}</p>
              </div>
              {result.extractedText && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Extracted Text:</p>
                  <div className="rounded-lg bg-secondary/30 p-4">
                    <p className="text-sm">{result.extractedText}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Classification Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Classification Reasons</CardTitle>
              <CardDescription>Why this claim was classified as {result.classification.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.classification.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations / Positive Feedback */}
          <Card className={isGenuine ? 'border-green-500/20' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isGenuine ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    What Makes This Claim Genuine
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Recommendations
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isGenuine 
                  ? 'Key factors that validate this environmental claim'
                  : 'How to improve this claim'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenuine && positiveAcknowledgments.length > 0 && (
                <div className="mb-4 pb-4 border-b border-green-500/20">
                  <p className="text-sm font-medium text-green-500 mb-2">Strengths Identified:</p>
                  <ul className="space-y-2">
                    {positiveAcknowledgments.map((ack, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-sm">{ack}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${isGenuine ? 'bg-green-500' : 'bg-amber-500'} shrink-0`} />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Risk Gauges */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Greenwashing Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskGauge value={result.riskScores.greenwashingRisk} type="risk" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Company Credibility</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskGauge value={result.riskScores.companyCredibility} type="credibility" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suspicious Phrases Tab */}
        <TabsContent value="phrases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Phrases Detected</CardTitle>
              <CardDescription>
                {result.suspiciousPhrases.length} phrases flagged for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.suspiciousPhrases.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <p className="mt-4 font-medium">
                    {isGenuine ? 'Claim Language Verified' : 'No suspicious phrases detected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isGenuine 
                      ? 'This claim uses clear, specific, and well-supported environmental language that meets best practice standards.'
                      : 'The claim appears to use appropriate language'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.suspiciousPhrases.map((phrase, index) => (
                    <SuspiciousPhraseCard key={index} phrase={phrase} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Highlighted Text */}
          {result.suspiciousPhrases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Highlighted Claim</CardTitle>
                <CardDescription>Suspicious phrases are highlighted in the original text</CardDescription>
              </CardHeader>
              <CardContent>
                <HighlightedText text={result.originalInput} phrases={result.suspiciousPhrases} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Historical Tab */}
        <TabsContent value="historical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historical Comparison
              </CardTitle>
              <CardDescription>
                Consistency score: {result.historicalComparison.consistencyScore}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={result.historicalComparison.consistencyScore} className="h-3 mb-6" />

              {/* Similar Claims */}
              {result.historicalComparison.similarities.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Similar Historical Claims</h4>
                  <div className="space-y-3">
                    {result.historicalComparison.similarities.map((sim) => (
                      <div
                        key={sim.claimId}
                        className="rounded-lg border bg-green-500/5 border-green-500/20 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            {Math.round(sim.similarity * 100)}% Similar
                          </Badge>
                        </div>
                        <p className="text-sm">{sim.claimText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contradictions */}
              {result.historicalComparison.contradictions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-destructive">Contradictions Found</h4>
                  <div className="space-y-3">
                    {result.historicalComparison.contradictions.map((con) => (
                      <div
                        key={con.claimId}
                        className="rounded-lg border bg-destructive/5 border-destructive/20 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">Contradiction</span>
                        </div>
                        <p className="text-sm mb-2">{con.claimText}</p>
                        {con.contradictionReason && (
                          <p className="text-xs text-muted-foreground">{con.contradictionReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.historicalComparison.similarities.length === 0 &&
                result.historicalComparison.contradictions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No significant matches with historical claims
                  </p>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sustainability Tab */}
        <TabsContent value="sustainability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sustainability Standards Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SDG Alignment */}
              <div>
                <h4 className="font-medium mb-3">UN Sustainable Development Goals Alignment</h4>
                <div className="flex flex-wrap gap-2">
                  {result.sustainabilityCheck.sdgAlignment.map((sdg) => (
                    <Badge key={sdg} variant="secondary" className="text-sm">
                      {sdg}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* GRI Compliance */}
              <div>
                <h4 className="font-medium mb-3">GRI Standards Compliance</h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      result.sustainabilityCheck.griCompliance === 'compliant'
                        ? 'text-green-500 border-green-500/30'
                        : result.sustainabilityCheck.griCompliance === 'partial'
                        ? 'text-amber-500 border-amber-500/30'
                        : 'text-red-500 border-red-500/30'
                    }
                  >
                    {result.sustainabilityCheck.griCompliance === 'compliant'
                      ? 'Compliant'
                      : result.sustainabilityCheck.griCompliance === 'partial'
                      ? 'Partially Compliant'
                      : 'Non-Compliant'}
                  </Badge>
                </div>
              </div>

              {/* ESG Notes */}
              <div>
                <h4 className="font-medium mb-3">ESG Assessment Notes</h4>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="text-sm">{result.sustainabilityCheck.esgNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RiskGauge({ value, type }: { value: number; type: 'risk' | 'credibility' }) {
  const getColor = () => {
    if (type === 'risk') {
      if (value >= 75) return 'text-red-500';
      if (value >= 50) return 'text-orange-500';
      if (value >= 25) return 'text-amber-500';
      return 'text-green-500';
    } else {
      if (value >= 75) return 'text-green-500';
      if (value >= 50) return 'text-primary';
      if (value >= 25) return 'text-amber-500';
      return 'text-red-500';
    }
  };

  const getLabel = () => {
    if (type === 'risk') {
      if (value >= 75) return 'Critical';
      if (value >= 50) return 'High';
      if (value >= 25) return 'Medium';
      return 'Low';
    } else {
      if (value >= 75) return 'Excellent';
      if (value >= 50) return 'Good';
      if (value >= 25) return 'Fair';
      return 'Poor';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`text-5xl font-bold ${getColor()}`}>{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{getLabel()}</div>
      <Progress value={value} className="mt-4 h-2" />
    </div>
  );
}

function SuspiciousPhraseCard({ phrase }: { phrase: SuspiciousPhrase }) {
  const severityColors = {
    low: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    medium: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    high: 'bg-red-500/10 border-red-500/20 text-red-500',
  };

  return (
    <div className={`rounded-lg border p-4 ${severityColors[phrase.severity]}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className={severityColors[phrase.severity]}>
          {phrase.severity.toUpperCase()} SEVERITY
        </Badge>
      </div>
      <p className="font-medium mb-1">&ldquo;{phrase.text}&rdquo;</p>
      <p className="text-sm text-muted-foreground">{phrase.reason}</p>
    </div>
  );
}

function HighlightedText({ text, phrases }: { text: string; phrases: SuspiciousPhrase[] }) {
  if (phrases.length === 0) return <p className="text-sm">{text}</p>;

  // Sort phrases by start index
  const sortedPhrases = [...phrases].sort((a, b) => a.startIndex - b.startIndex);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedPhrases.forEach((phrase, index) => {
    // Add text before this phrase
    if (phrase.startIndex > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>{text.slice(lastIndex, phrase.startIndex)}</span>
      );
    }

    // Add highlighted phrase
    const severityColors = {
      low: 'bg-amber-500/20 text-amber-500',
      medium: 'bg-orange-500/20 text-orange-500',
      high: 'bg-red-500/20 text-red-500',
    };

    parts.push(
      <TooltipProvider key={`phrase-${index}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`rounded px-1 cursor-help ${severityColors[phrase.severity]}`}
            >
              {phrase.text}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{phrase.reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    lastIndex = phrase.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return <div className="rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed">{parts}</div>;
}
