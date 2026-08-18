'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Sparkles, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { fetchUser } = useAuth();
  const unwrappedParams = React.use(params);
  
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      
      await api.acceptInvite({
        token: unwrappedParams.token,
        password,
      });

      setSuccess(true);
      await fetchUser();
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-foreground text-background font-bold shadow-sm">
            <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Join your team on Taskly
        </h2>
        <p className="text-sm text-muted-foreground">
          Set a secure password to activate your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">Account activated successfully!</p>
              <p className="text-xs text-muted-foreground">Redirecting to your workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <div className="relative">
                  <Input
                    label="Create a Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4" />}
                    required
                  />
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Must be at least 6 characters long.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                isLoading={isSubmitting}
              >
                Activate Account
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
