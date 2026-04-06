'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { Chatbot } from '@/components/shared/chatbot';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      router.push('/');
      return;
    }
    // Admin can also access user pages for testing
  }, [state.auth.isAuthenticated, router]);

  if (!state.auth.isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="user" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium">Claim Analysis Portal</span>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
        <Chatbot />
      </SidebarInset>
    </SidebarProvider>
  );
}
