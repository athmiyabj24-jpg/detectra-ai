'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  FileText,
  Image as ImageIcon,
  Video,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import type { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow, format } from 'date-fns';
import { AnalysisResults } from '@/components/user/analysis-results';

export default function HistoryPage() {
  const { state } = useApp();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredAnalyses = useMemo(() => {
    return state.analyses.filter((analysis) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCompany = analysis.companyName.toLowerCase().includes(query);
        const matchesInput = analysis.originalInput.toLowerCase().includes(query);
        if (!matchesCompany && !matchesInput) return false;
      }

      // Classification filter
      if (filterClassification !== 'all' && analysis.classification.label !== filterClassification) {
        return false;
      }

      // Risk filter
      if (filterRisk !== 'all' && analysis.riskScores.riskLevel !== filterRisk) {
        return false;
      }

      return true;
    });
  }, [state.analyses, searchQuery, filterClassification, filterRisk]);

  const selectedAnalysis = selectedId ? state.analyses.find((a) => a.id === selectedId) : null;

  if (selectedAnalysis) {
    return (
      <div className="p-6">
        <AnalysisResults
          result={selectedAnalysis}
          onNewAnalysis={() => {
            window.history.pushState({}, '', '/user/history');
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analysis History</h1>
          <p className="text-muted-foreground">
            View and filter your past claim analyses
          </p>
        </div>
        <Button asChild>
          <Link href="/user/analyze">New Analysis</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by company or claim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClassification} onValueChange={setFilterClassification}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="genuine">Genuine</SelectItem>
                <SelectItem value="misleading">Misleading</SelectItem>
                <SelectItem value="exaggerated">Exaggerated</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || filterClassification !== 'all' || filterRisk !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setFilterClassification('all');
                  setFilterRisk('all');
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results ({filteredAnalyses.length})</CardTitle>
          <CardDescription>
            {filteredAnalyses.length === state.analyses.length
              ? 'All analyses'
              : `Filtered from ${state.analyses.length} total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAnalyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No analyses found</p>
              <p className="text-sm text-muted-foreground">
                {state.analyses.length === 0
                  ? 'Start by analyzing your first claim'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnalyses.map((analysis) => (
                <AnalysisCard key={analysis.id} analysis={analysis} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: AnalysisResult }) {
  const InputTypeIcon = {
    text: FileText,
    image: ImageIcon,
    video: Video,
  }[analysis.inputType];

  const classificationColors: Record<string, string> = {
    genuine: 'bg-green-500',
    misleading: 'bg-amber-500',
    exaggerated: 'bg-orange-500',
    false: 'bg-red-500',
  };

  const riskColors: Record<string, string> = {
    low: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <Link
      href={`/user/history?id=${analysis.id}`}
      className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-secondary/30"
    >
      {/* Classification Indicator */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          classificationColors[analysis.classification.label]
        }`}
      >
        {analysis.classification.label === 'genuine' ? (
          <CheckCircle className="h-6 w-6 text-white" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium">{analysis.companyName}</h3>
          <Badge variant="outline" className={riskColors[analysis.riskScores.riskLevel]}>
            {analysis.riskScores.riskLevel.toUpperCase()} RISK
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {analysis.classification.label}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {analysis.originalInput}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <InputTypeIcon className="h-3 w-3" />
            {analysis.inputType}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
          </span>
          <span>
            Confidence: {Math.round(analysis.classification.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Risk Score */}
      <div className="hidden sm:flex flex-col items-center">
        <div className="text-2xl font-bold text-foreground">
          {analysis.riskScores.greenwashingRisk}
        </div>
        <div className="text-xs text-muted-foreground">Risk Score</div>
      </div>
    </Link>
  );
}
