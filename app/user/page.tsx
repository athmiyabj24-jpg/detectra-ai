'use client';

import Link from 'next/link';
import { FileSearch, History, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { state } = useApp();

  const userAnalyses = state.analyses;
  const recentAnalyses = userAnalyses.slice(0, 5);

  const stats = {
    totalAnalyses: userAnalyses.length,
    highRiskCount: userAnalyses.filter((a) => a.riskScores.riskLevel === 'high' || a.riskScores.riskLevel === 'critical').length,
    genuineCount: userAnalyses.filter((a) => a.classification.label === 'genuine').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Analyze sustainability claims and detect greenwashing
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/user/analyze">
            <FileSearch className="mr-2 h-5 w-5" />
            Analyze New Claim
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileSearch className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highRiskCount}</p>
                <p className="text-sm text-muted-foreground">High Risk Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.genuineCount}</p>
                <p className="text-sm text-muted-foreground">Genuine Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Your latest claim verifications</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/user/history">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentAnalyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSearch className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No analyses yet</p>
              <p className="text-sm text-muted-foreground">
                Start by analyzing your first sustainability claim
              </p>
              <Button className="mt-4" asChild>
                <Link href="/user/analyze">Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/user/history?id=${analysis.id}`}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-4">
                    <ClassificationIndicator label={analysis.classification.label} />
                    <div>
                      <p className="font-medium">{analysis.companyName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                        {analysis.originalInput.substring(0, 80)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <RiskBadge level={analysis.riskScores.riskLevel} />
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Three simple steps to verify sustainability claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary/30 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h3 className="font-medium">Input Claim</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter text, upload an image, or provide a video of the sustainability claim
              </p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <h3 className="font-medium">AI Analysis</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Our AI analyzes the claim using NLP, historical data, and sustainability standards
              </p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <h3 className="font-medium">Get Results</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review classification, risk scores, and detailed explanations with our chatbot
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClassificationIndicator({ label }: { label: string }) {
  const colors: Record<string, string> = {
    genuine: 'bg-green-500',
    misleading: 'bg-amber-500',
    exaggerated: 'bg-orange-500',
    false: 'bg-red-500',
  };

  return (
    <div className={`h-10 w-10 rounded-full ${colors[label] || 'bg-secondary'} flex items-center justify-center`}>
      {label === 'genuine' && <CheckCircle className="h-5 w-5 text-white" />}
      {label !== 'genuine' && <AlertTriangle className="h-5 w-5 text-white" />}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    low: { variant: 'secondary', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    medium: { variant: 'secondary', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    high: { variant: 'secondary', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    critical: { variant: 'destructive', className: '' },
  };

  const { className } = config[level] || config.medium;

  return (
    <Badge variant="outline" className={className}>
      {level.toUpperCase()} RISK
    </Badge>
  );
}
