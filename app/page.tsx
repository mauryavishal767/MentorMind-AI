'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, TrendingUp, Users, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
      
      if (user) {
        router.push('/dashboard');
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push('/dashboard');
      }
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Mentors',
      description: 'Personalized guidance from expert AI mentors specialized in different fields',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageSquare,
      title: 'Natural Conversations',
      description: 'Engage in natural, flowing conversations with voice synthesis capabilities',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed progress tracking and insights',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with other learners and share your achievements and insights',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const benefits = [
    'Personalized learning paths tailored to your goals',
    '24/7 availability - learn at your own pace',
    'Expert knowledge across multiple domains',
    'Voice-enabled conversations for natural interaction',
    'Progress tracking and achievement recognition',
    'Community support and peer learning',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MentorMind
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Learning Platform
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Personal AI Mentor Awaits
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unlock your potential with personalized AI mentoring. Get expert guidance, 
              track your progress, and accelerate your learning journey with MentorMind.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/auth/signup">
                  Start Learning Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose MentorMind?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of personalized learning with our cutting-edge AI mentoring platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transform Your Learning Experience
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of learners who have accelerated their growth with AI-powered mentoring. 
                Get personalized guidance, track your progress, and achieve your goals faster.
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/auth/signup">
                  Get Started Today
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join MentorMind today and experience personalized AI mentoring that adapts to your unique learning style and goals.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/auth/signup">
                Start Learning Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 font-bold text-xl mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span>MentorMind</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering learners with AI-powered mentoring
          </p>
          <p className="text-sm text-gray-500">
            © 2025 MentorMind. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}