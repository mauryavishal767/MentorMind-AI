'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { MentorSelector } from '@/components/mentor/mentor-selector';
import { ChatInterface } from '@/components/chat/chat-interface';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase, type Mentor, type Conversation } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

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

  const handleMentorSelect = async (mentor: Mentor) => {
    setSelectedMentor(mentor);
    
    try {
      // Create a new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_id: user.id,
            mentor_id: mentor.id,
            title: `Chat with ${mentor.name}`,
            status: 'active',
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentConversation({ ...data, mentor });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

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
        {!selectedMentor ? (
          <MentorSelector onMentorSelect={handleMentorSelect} />
        ) : currentConversation ? (
          <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
            <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
              <ChatInterface
                conversation={currentConversation}
                mentor={selectedMentor}
                userId={user.id}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </main>
    </div>
  );
}