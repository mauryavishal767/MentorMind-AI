'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { signIn, signUp } from '@/lib/supabase';
import { Brain } from 'lucide-react';
import Link from 'next/link';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignUpData>({
    resolver: zodResolver(mode === 'signin' ? signInSchema : signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpData) => {
    setIsLoading(true);
    
    try {
      if (mode === 'signin') {
        const { error } = await signIn(data.email, data.password);
        if (error) throw error;
        
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        router.push('/dashboard');
      } else {
        const { error } = await signUp(data.email, data.password, data.fullName);
        if (error) throw error;
        
        toast({
          title: 'Account created!',
          description: 'Welcome to MentorMind. You can now start your learning journey.',
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode === 'signin' ? 'sign in' : 'create account'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl w-fit">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? 'Sign in to continue your learning journey' 
                : 'Start your personalized AI mentoring experience'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...form.register('fullName')}
                  disabled={isLoading}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...form.register('email')}
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register('password')}
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...form.register('confirmPassword')}
                  disabled={isLoading}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}