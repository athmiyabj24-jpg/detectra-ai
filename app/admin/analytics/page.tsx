'use client';

import { useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { formatDistanceToNow, format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Activity, FileSearch, TrendingUp, Users } from 'lucide-react';

const CHART_COLORS = {
  primary: 'hsl(162, 72%, 47%)',
  secondary: 'hsl(162, 72%, 37%)',
  accent: 'hsl(85, 50%, 50%)',
  muted: 'hsl(240, 5%, 45%)',
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  genuine: '#22c55e',
  misleading: '#f59e0b',
  exaggerated: '#f97316',
  false: '#ef4444',
};

export default function AnalyticsPage() {
  const { state } = useApp();

  // Activity over time (last 7 days)
  const activityByDay = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = state.activities.filter((a) => {
        const activityDate = new Date(a.timestamp);
        return activityDate >= dayStart && activityDate < dayEnd;
      }).length;

      return {
        date: format(day, 'MMM dd'),
        activities: count,
      };
    });
  }, [state.activities]);

  // Classification distribution
  const classificationData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.analyses.forEach((a) => {
      counts[a.classification.label] = (counts[a.classification.label] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: CLASSIFICATION_COLORS[name] || CHART_COLORS.muted,
    }));
  }, [state.analyses]);

  // Top analyzed companies
  const topCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    state.analyses.forEach((a) => {
      counts[a.companyName] = (counts[a.companyName] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [state.analyses]);

  // Activity by type
  const activityByType = useMemo(() => {
    const counts: Record<string, number> = {};
    state.activities.forEach((a) => {
      counts[a.action] = (counts[a.action] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      type: type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1),
      count,
    }));
  }, [state.activities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor user activity, analysis trends, and system performance
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Activities"
          value={state.activities.length}
          icon={<Activity className="h-4 w-4" />}
          change="+12% from last week"
        />
        <StatCard
          title="Analyses Performed"
          value={state.analyses.length}
          icon={<FileSearch className="h-4 w-4" />}
          change="All time"
        />
        <StatCard
          title="Companies Tracked"
          value={state.companies.length}
          icon={<TrendingUp className="h-4 w-4" />}
          change="In database"
        />
        <StatCard
          title="User Sessions"
          value={state.activities.filter((a) => a.action === 'login').length}
          icon={<Users className="h-4 w-4" />}
          change="Total logins"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>User activity for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityByDay}>
                  <defs>
                    <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 25%)" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(240, 5%, 45%)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(240, 5%, 45%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 5%, 15%)',
                      border: '1px solid hsl(240, 5%, 25%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="activities"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActivities)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Classification Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Classification Distribution</CardTitle>
            <CardDescription>Breakdown of analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {classificationData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No analysis data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classificationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {classificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(240, 5%, 15%)',
                        border: '1px solid hsl(240, 5%, 25%)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Analyzed Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Analyzed Companies</CardTitle>
            <CardDescription>Companies with most claim analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {topCompanies.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No analysis data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCompanies} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 25%)" />
                    <XAxis type="number" stroke="hsl(240, 5%, 45%)" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(240, 5%, 45%)"
                      fontSize={12}
                      width={120}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(240, 5%, 15%)',
                        border: '1px solid hsl(240, 5%, 25%)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Log</CardTitle>
            <CardDescription>Latest user actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[250px] overflow-auto">
              {state.activities.slice(0, 10).map((activity) => (
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
              ))}
              {state.activities.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No activity recorded yet
                </p>
              )}
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
  change,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: string;
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
          <p className="text-xs text-muted-foreground">{change}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityBadge({ action }: { action: string }) {
  const config: Record<string, { bg: string; icon: React.ReactNode }> = {
    login: { bg: 'bg-blue-500/10 text-blue-500', icon: <Users className="h-4 w-4" /> },
    analysis: { bg: 'bg-primary/10 text-primary', icon: <FileSearch className="h-4 w-4" /> },
    view_result: { bg: 'bg-amber-500/10 text-amber-500', icon: <TrendingUp className="h-4 w-4" /> },
    chat: { bg: 'bg-purple-500/10 text-purple-500', icon: <Activity className="h-4 w-4" /> },
  };

  const { bg, icon } = config[action] || { bg: 'bg-secondary', icon: <Activity className="h-4 w-4" /> };

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bg}`}>
      {icon}
    </div>
  );
}
