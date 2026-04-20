'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Search,
  History,
  Leaf,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/companies', label: 'Companies', icon: Building2 },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const userNavItems = [
  { href: '/user', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/user/analyze', label: 'Analyze Claim', icon: Search },
  { href: '/user/history', label: 'History', icon: History },
];

interface AppSidebarProps {
  variant: 'admin' | 'user';
}

export function AppSidebar({ variant }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, logout } = useApp();
  const navItems = variant === 'admin' ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href={variant === 'admin' ? '/admin' : '/user'} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Detectra AI</span>
            <span className="text-xs text-muted-foreground">
              {variant === 'admin' ? 'Admin Portal' : 'User Portal'}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            {variant === 'admin' ? (
              <Shield className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">
              {state.auth.user?.username || 'Guest'}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {state.auth.user?.role || 'Unknown'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
