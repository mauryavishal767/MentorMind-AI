'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      
      setUser(user);
      setIsLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push('/auth/signin');
      }
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <DashboardOverview userId={user.id} />
      </main>
    </div>
  );
}