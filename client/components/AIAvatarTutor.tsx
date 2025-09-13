import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, BookText, Lightbulb } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatRequest, ChatResponse, ChatHistoryResponse, GoalDetail } from "@shared/api";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';

interface AIAvatarTutorProps {
  goalId: string;
  goalTitle: string;
}

const AIAvatarTutor: React.FC<AIAvatarTutorProps> = ({ goalId, goalTitle }) => {
  const [message, setMessage] = React.useState('');
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const { data: chatHistory } = useQuery<ChatHistoryResponse>({
    queryKey: ['chatHistory', goalId],
    queryFn: () => api.get(`/chat/${goalId}`, token),
    enabled: !!goalId && !!token,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatHistory?.messages]);

  const chatMutation = useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: (newChat) => api.post(`/chat`, newChat, token),
    onSuccess: (data, variables) => {
      // Update the chat history cache with the new messages
      queryClient.setQueryData<ChatHistoryResponse>(['chatHistory', goalId], (oldData) => {
        const newMessages = [
          ...(oldData?.messages || []),
          {
            role: 'user' as const,
            content: variables.message,
            timestamp: new Date().toISOString(),
          },
          {
            role: 'assistant' as const,
            content: data.reply,
            timestamp: new Date().toISOString(),
          },
        ];
        return { messages: newMessages };
      });
      setMessage('');
    },
  });

  const handleSendMessage = (type: 'chat' | 'learning_module' | 'practice_problem' = 'chat') => {
    let messageToSend = message;
    if (type === 'learning_module') {
      messageToSend = 'Please provide a learning module for this goal';
    } else if (type === 'practice_problem') {
      messageToSend = 'Please provide a practice problem for this goal';
    }

    if (messageToSend.trim()) {
      chatMutation.mutate({ goalId, message: messageToSend, type });
    }
  };

  // Placeholder for video feed
  const renderVideoFeed = () => (
    <div className="relative w-full h-48 bg-gray-800 rounded-md flex items-center justify-center mb-4">
      <img src="/placeholder.svg" alt="AI Avatar" className="h-32 w-32 rounded-full object-cover" />
      <div className="absolute bottom-2 right-2 bg-green-500 w-3 h-3 rounded-full animate-pulse" title="Online"></div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Tutor: {goalTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {renderVideoFeed()}
        <ScrollArea ref={scrollAreaRef} className="flex-grow h-60 p-4 border rounded-md mb-4 bg-gray-50">
          <div className="space-y-4">
            {(!chatHistory?.messages || chatHistory.messages.length === 0) && (
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="flex-1 grid gap-0.5">
                  <div className="font-semibold">AI Tutor</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:dark:text-gray-100 prose-p:text-gray-700 prose-p:dark:text-gray-300 prose-strong:text-gray-900 prose-strong:dark:text-gray-100">
                      <ReactMarkdown>
                        {`Hello! How can I help you with your goal **"${goalTitle}"** today?`}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {chatHistory?.messages?.map((msg, index) => (
              <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex-1 grid gap-0.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className="font-semibold">{msg.role === 'user' ? 'You' : 'AI Tutor'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:dark:text-gray-100 prose-p:text-gray-700 prose-p:dark:text-gray-300 prose-strong:text-gray-900 prose-strong:dark:text-gray-100 prose-code:text-gray-900 prose-code:dark:text-gray-100 prose-pre:bg-gray-100 prose-pre:dark:bg-gray-800">
                        <ReactMarkdown>
                          {String(msg.content)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mb-2">
          <Button variant="outline" onClick={() => handleSendMessage('learning_module')}>
            <BookText className="h-4 w-4 mr-2" />
            Module
          </Button>
          <Button variant="outline" onClick={() => handleSendMessage('practice_problem')}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Problem
          </Button>
        </div>
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button type="submit" onClick={() => handleSendMessage()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAvatarTutor;