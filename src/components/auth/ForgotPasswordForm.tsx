'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/lib/firebase/auth';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      toast.success('Password reset email sent!');
      setIsSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground">
            We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        <Button className="w-full" render={<Link href="/login" />}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-sm">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
};
