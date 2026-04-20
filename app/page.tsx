'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { LoginForm } from '@/components/auth/login-form';
import { Leaf, ShieldCheck, BarChart3, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (state.auth.isAuthenticated && state.auth.user) {
      router.push(state.auth.user.role === 'admin' ? '/admin' : '/user');
    }
  }, [state.auth.isAuthenticated, state.auth.user, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Hero section */}
      <div className="relative z-10 mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
          <ShieldCheck className="h-4 w-4" />
          AI-Powered Verification
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Detect Greenwashing with
          <span className="text-primary"> Confidence</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
          Advanced AI analysis to verify environmental claims, compare historical data, 
          and identify misleading sustainability marketing.
        </p>
      </div>

      {/* Login form */}
      <LoginForm />

      {/* Features */}
      <div className="relative z-10 mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={<Leaf className="h-5 w-5" />}
          title="Claim Analysis"
          description="NLP-powered analysis of environmental claims from text, images, and videos"
        />
        <FeatureCard
          icon={<BarChart3 className="h-5 w-5" />}
          title="Risk Scoring"
          description="Quantified greenwashing risk with explainable AI insights"
        />
        <FeatureCard
          icon={<MessageSquare className="h-5 w-5" />}
          title="AI Assistant"
          description="Interactive chatbot to explain analysis results and answer questions"
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-12 text-center text-sm text-muted-foreground">
        <p>Detectra AI - Sustainability Claim Verification Platform</p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-lg border border-border/50 bg-card/30 p-4 backdrop-blur transition-colors hover:border-primary/30 hover:bg-card/50">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
