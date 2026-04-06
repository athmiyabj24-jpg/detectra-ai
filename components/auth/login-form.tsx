'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Lock, User, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = login(username, password);
    
    if (success) {
      // Determine redirect based on role
      const isAdmin = username === 'admin';
      router.push(isAdmin ? '/admin' : '/user');
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Leaf className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome to GreenVerify AI</CardTitle>
        <CardDescription>
          Sign in to detect and analyze greenwashing claims
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </Field>
            
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <FieldError>{error}</FieldError>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6 space-y-3 rounded-lg bg-secondary/50 p-4">
          <p className="text-xs font-medium text-muted-foreground">Demo Credentials</p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">Admin:</span>
              <code className="font-mono text-foreground">admin / admin123</code>
            </div>
            <div className="flex items-center justify-between rounded-md bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">User:</span>
              <code className="font-mono text-foreground">user / user123</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
