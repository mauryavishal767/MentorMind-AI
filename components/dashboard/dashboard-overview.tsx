'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase, type Conversation, type ProgressTracking, type Mentor } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, TrendingUp, Target, Calendar, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface DashboardOverviewProps {
  userId: string;
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [conversations, setConversations] = useState<(Conversation & { mentor: Mentor })[]>([]);
  const [progress, setProgress] = useState<ProgressTracking[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    activeTopics: 0,
    thisWeekSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      // Load recent conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          mentor:mentors(*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (conversationsError) throw conversationsError;

      // Load progress tracking
      const { data: progressData, error: progressError } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity_at', { ascending: false });

      if (progressError) throw progressError;

      setConversations(conversationsData || []);
      setProgress(progressData || []);

      // Calculate stats
      const totalSessions = progressData?.reduce((sum, p) => sum + p.sessions_completed, 0) || 0;
      const totalMinutes = progressData?.reduce((sum, p) => sum + p.total_time_minutes, 0) || 0;
      const activeTopics = progressData?.length || 0;
      
      // Calculate this week's sessions (simplified)
      const thisWeekSessions = Math.floor(totalSessions * 0.3); // Placeholder calculation

      setStats({
        totalSessions,
        totalMinutes,
        activeTopics,
        thisWeekSessions,
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100 mb-4">
          Ready to continue your learning journey? Your AI mentors are here to help.
        </p>
        <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
          <Link href="/chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Start New Conversation
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisWeekSessions} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average: {stats.totalSessions > 0 ? Math.round(stats.totalMinutes / stats.totalSessions) : 0}min per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Topics</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTopics}</div>
            <p className="text-xs text-muted-foreground">
              Areas of focus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessions completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Conversations
              <Button variant="outline" size="sm" asChild>
                <Link href="/chat">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>
              Continue where you left off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.mentor.avatar_url} alt={conversation.mentor.name} />
                    <AvatarFallback>{conversation.mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conversation.title || `Chat with ${conversation.mentor.name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {conversation.mentor.name} • {formatDistanceToNow(new Date(conversation.updated_at))} ago
                    </p>
                  </div>
                  <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                    {conversation.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start your first conversation with an AI mentor</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>
              Your skill development across topics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress.length > 0 ? (
              progress.slice(0, 5).map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{item.topic}</span>
                    <Badge variant="outline" className="capitalize">
                      {item.skill_level}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{item.sessions_completed} sessions</span>
                      <span>{Math.floor(item.total_time_minutes / 60)}h {item.total_time_minutes % 60}m</span>
                    </div>
                    {/* Progress bar based on sessions completed */}
                    <Progress value={Math.min((item.sessions_completed / 10) * 100, 100)} className="h-2" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No progress yet</p>
                <p className="text-sm">Start learning to track your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}