import React from 'react';
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGoalApi, getProgressApi, toggleMilestoneApi } from "@/lib/goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AIAvatarTutor from "@/components/AIAvatarTutor";

// Create a wrapper component to catch errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in GoalPage:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground">We're having trouble loading this goal.</p>
            </div>
          </div>
        </AppLayout>
      );
    }

    return this.props.children;
  }
}

const GoalPageContent = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Handle authentication and ID validation
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    // Only validate on initial load or when ID changes
    if (initialLoad) {
      setInitialLoad(false);
      
      // Validate ID
      if (!id || id === 'undefined' || id === 'null') {
        console.log('Invalid goal ID, redirecting to dashboard');
        setIsRedirecting(true);
        // Use setTimeout to ensure navigation happens after render
        const timer = setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 0);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, navigate, id, initialLoad]);
  
  // Show loading state while redirecting or if ID is invalid
  if (isRedirecting || !id || id === 'undefined' || id === 'null') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const goalQuery = useQuery({
    queryKey: ["goal", id], 
    queryFn: async () => {
      if (!id) throw new Error('No goal ID provided');
      try {
        return await getGoalApi(id);
      } catch (error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          navigate('/dashboard');
          throw new Error('Goal not found');
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
  
  const progressQuery = useQuery({ 
    queryKey: ["progress", id], 
    queryFn: async () => {
      if (!id) throw new Error('No goal ID provided');
      try {
        return await getProgressApi(id);
      } catch (error) {
        // Don't redirect for progress errors, just return null
        console.error('Error fetching progress:', error);
        return null;
      }
    },
    enabled: !!id && !goalQuery.isError,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const toggleMilestone = useMutation({
    mutationFn: (v: { week: number; completed: boolean }) => {
      if (!id) throw new Error('No goal ID available');
      return toggleMilestoneApi(id, v.week, v.completed);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["goal", id] });
        queryClient.invalidateQueries({ queryKey: ["progress", id] });
      }
    },
  });

  const goal = goalQuery.data;

  return (
    <AppLayout>
      {!goal ? null : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{goal.title}</span>
                  <span className="text-sm text-muted-foreground">{goal.timeline}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                <Progress value={goal.progress} />
                <div>
                  <h3 className="font-medium mb-2">Milestones</h3>
                  <ul className="space-y-2">
                    {goal.milestones.map((m) => (
                      <li key={m.week} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!m.completed}
                          onChange={(e) => toggleMilestone.mutate({ week: m.week, completed: e.target.checked })}
                        />
                        <span className={m.completed ? "line-through text-muted-foreground" : ""}>
                          Week {m.week}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <section>
              <h2 className="text-xl font-semibold mb-3">AI Tutor</h2>
              <AIAvatarTutor goalId={id!} goalTitle={goal.title} />
            </section>
          </div>
          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Completion</span><span>{progressQuery.data?.completion ?? goal.progress}%</span></div>
                <div className="flex justify-between"><span>Velocity</span><span>{progressQuery.data?.velocity ?? "–"}</span></div>
                <p className="text-muted-foreground">{progressQuery.data?.summary ?? ""}</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </AppLayout>
  );
};

export default function GoalPage() {
  return (
    <ErrorBoundary>
      <GoalPageContent />
    </ErrorBoundary>
  );
}
