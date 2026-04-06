'use client';

import Link from 'next/link';
import { Building2, FileSearch, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { state } = useApp();

  const stats = {
    totalCompanies: state.companies.length,
    totalClaims: state.companies.reduce((acc, c) => acc + c.historicalClaims.length, 0),
    totalAnalyses: state.analyses.length,
    recentActivities: state.activities.slice(0, 5),
  };

  const classificationCounts = state.analyses.reduce(
    (acc, a) => {
      acc[a.classification.label] = (acc[a.classification.label] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage companies, claims, and monitor user activity
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/companies">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={stats.totalCompanies}
          icon={<Building2 className="h-4 w-4" />}
          description="In database"
        />
        <StatCard
          title="Historical Claims"
          value={stats.totalClaims}
          icon={<FileSearch className="h-4 w-4" />}
          description="Across all companies"
        />
        <StatCard
          title="Analyses Performed"
          value={stats.totalAnalyses}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Total claim analyses"
        />
        <StatCard
          title="Active Users"
          value={state.activities.filter((a) => a.action === 'login').length}
          icon={<Users className="h-4 w-4" />}
          description="Login sessions"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user actions in the system</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/analytics">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                stats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <ActivityBadge action={activity.action} />
                      <div>
                        <p className="text-sm font-medium">{activity.details}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
            <CardDescription>Classification distribution of analyzed claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(classificationCounts).length === 0 ? (
                <p className="text-sm text-muted-foreground">No analyses performed yet</p>
              ) : (
                Object.entries(classificationCounts).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClassificationBadge label={label} />
                      <span className="text-sm capitalize">{label}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/admin/companies">
                  <Building2 className="h-6 w-6 text-primary" />
                  <span>Manage Companies</span>
                  <span className="text-xs text-muted-foreground">Add, edit, or remove</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/admin/analytics">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span>View Analytics</span>
                  <span className="text-xs text-muted-foreground">User activity & trends</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/user/analyze">
                  <FileSearch className="h-6 w-6 text-primary" />
                  <span>Test Analysis</span>
                  <span className="text-xs text-muted-foreground">Try the user interface</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    login: 'bg-blue-500/10 text-blue-500',
    analysis: 'bg-primary/10 text-primary',
    view_result: 'bg-amber-500/10 text-amber-500',
    chat: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors[action] || 'bg-secondary'}`}>
      {action === 'login' && <Users className="h-4 w-4" />}
      {action === 'analysis' && <FileSearch className="h-4 w-4" />}
      {action === 'view_result' && <TrendingUp className="h-4 w-4" />}
      {action === 'chat' && <Users className="h-4 w-4" />}
    </div>
  );
}

function ClassificationBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    genuine: 'bg-green-500',
    misleading: 'bg-amber-500',
    exaggerated: 'bg-orange-500',
    false: 'bg-red-500',
  };

  return <div className={`h-3 w-3 rounded-full ${colors[label] || 'bg-secondary'}`} />;
}
