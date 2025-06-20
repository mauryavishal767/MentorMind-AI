'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase, type Mentor } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, MessageSquare } from 'lucide-react';

interface MentorSelectorProps {
  onMentorSelect: (mentor: Mentor) => void;
  selectedMentorId?: string;
}

export function MentorSelector({ onMentorSelect, selectedMentorId }: MentorSelectorProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setMentors(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load mentors',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your AI Mentor</h2>
        <p className="text-muted-foreground">
          Select a mentor that matches your learning goals and preferred communication style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <Card
            key={mentor.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              selectedMentorId === mentor.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:border-blue-200'
            }`}
            onClick={() => onMentorSelect(mentor)}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentor.avatar_url} alt={mentor.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {mentor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {mentor.name}
                    {mentor.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="truncate">
                    {mentor.personality.split(',').map(trait => trait.trim()).join(' • ')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {mentor.description}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.expertise.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.expertise.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                variant={selectedMentorId === mentor.id ? "default" : "outline"}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {selectedMentorId === mentor.id ? 'Selected' : 'Start Conversation'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}