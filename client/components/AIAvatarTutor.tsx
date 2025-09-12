import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, BookText, Lightbulb } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatRequest, ChatResponse, GoalDetail } from "@shared/api";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AIAvatarTutorProps {
  goalId: string;
  goalTitle: string;
}

const AIAvatarTutor: React.FC<AIAvatarTutorProps> = ({ goalId, goalTitle }) => {
  const [message, setMessage] = React.useState('');
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch chat history (if needed, or rely on mutation to update cache)
  // For now, we'll just use mutations to send messages and update the UI

  const chatMutation = useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: (newChat) => api.post(`/chat`, newChat, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatHistory', goalId] as any); // Temporarily cast to any to resolve type error
      setMessage('');
    },
  });

  const handleSendMessage = (type: 'chat' | 'learning_module' | 'practice_problem' = 'chat') => {
    if (message.trim()) {
      chatMutation.mutate({ goalId, message, type });
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
        <ScrollArea className="flex-grow h-60 p-4 border rounded-md mb-4 bg-gray-50">
          {/* Placeholder for chat messages */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="flex-1 grid gap-0.5">
                <div className="font-semibold">AI Tutor</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Hello! How can I help you with your goal "{goalTitle}" today?
                </div>
              </div>
            </div>
            {/* Dynamically rendered chat messages would go here */}
            {/* Example of a user message */}
            {/*
            <div className="flex items-start gap-4 justify-end">
              <div className="flex-1 grid gap-0.5 text-right">
                <div className="font-semibold">You</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Can you explain linear regression?
                </div>
              </div>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
            </div>
            */}
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