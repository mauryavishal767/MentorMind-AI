'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Send, Mic, Volume2, VolumeX } from 'lucide-react';
import { supabase, type Message, type Conversation, type Mentor } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  conversation: Conversation;
  mentor: Mentor;
  userId: string;
}

export function ChatInterface({ conversation, mentor, userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversation messages
  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } else {
      setMessages(data || []);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = {
      role: 'user' as const,
      content: content.trim(),
      conversation_id: conversation.id,
    };

    try {
      // Add user message to database
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('messages')
        .insert([userMessage])
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      setMessages(prev => [...prev, userMsgData]);
      setInputValue('');

      // Generate AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mentorId: mentor.id,
          conversationId: conversation.id,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant message to database
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.content,
        conversation_id: conversation.id,
        metadata: { response_time: data.responseTime },
      };

      const { data: assistantMsgData, error: assistantMsgError } = await supabase
        .from('messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      setMessages(prev => [...prev, assistantMsgData]);

      // Generate speech if voice is enabled
      if (mentor.voice_id && data.content) {
        generateSpeech(data.content);
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSpeech = async (text: string) => {
    if (!mentor.voice_id) return;

    setIsSpeaking(true);
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: mentor.voice_id,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
      }
    } catch (error) {
      console.error('Speech generation error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <Avatar className="h-10 w-10">
          <AvatarImage src={mentor.avatar_url} alt={mentor.name} />
          <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{mentor.name}</h3>
          <p className="text-sm text-muted-foreground">{mentor.description}</p>
        </div>
        {isSpeaking && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.role === 'user' ? (
                      <AvatarFallback className="bg-blue-500 text-white">
                        {userId?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={mentor.avatar_url} alt={mentor.name} />
                        <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <CardContent className="p-3">
                      {message.role === 'assistant' ? (
                        <ReactMarkdown className="prose prose-sm max-w-none">
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex space-x-3 max-w-[85%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mentor.avatar_url} alt={mentor.name} />
                  <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-3 flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${mentor.name} for guidance...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}