import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGoalApi, deleteGoalApi, listGoalsApi } from "@/lib/goals";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import CheckinSettings from "@/components/CheckinSettings";
import CheckinCalendar from "@/components/CheckinCalendar";
import ProgressAssessmentForm from "@/components/ProgressAssessmentForm";
import ProgressChart from "@/components/ProgressChart";
import ProgressStats from "@/components/ProgressStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth");
  }, [isAuthenticated, navigate]);

  const queryClient = useQueryClient();
  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: listGoalsApi });

  const createGoal = useMutation({
    mutationFn: createGoalApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      if (res.goalId) {
        navigate(`/goal/${res.goalId}`);
      } else {
        console.error("Failed to create goal: No goalId returned.");
        // Optionally, navigate to a generic dashboard or show a toast error
        navigate("/dashboard");
      }
    },
  });

  const deleteGoal = useMutation({
    mutationFn: deleteGoalApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const chartData = (goalsQuery.data || []).map((g, i) => ({ name: g.title.length > 12 ? g.title.slice(0, 12) + "…" : g.title, value: g.progress, idx: i + 1 }));

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Your goals</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(goalsQuery.data || []).map((g) => (
                g.id ? (
                  <GoalCard key={g.id} goal={g} onDelete={(id) => deleteGoal.mutate(id)} />
                ) : (
                  <p key={`placeholder-${g.title}`} className="text-sm text-muted-foreground">Invalid goal data for: {g.title}</p>
                )
              ))}
              {goalsQuery.data?.length === 0 && (
                <p className="text-sm text-muted-foreground">No goals yet. Create your first goal.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Create a goal</h2>
            <CreateGoalDialog onCreate={(v) => createGoal.mutateAsync(v)} />
          </section>

          <section>
            <ProgressStats />
          </section>

          <section>
            <ProgressChart />
          </section>
        </div>
        <aside className="space-y-6">
          <CheckinSettings />

          <Card>
            <CardHeader>
              <CardTitle>Quick Check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressAssessmentForm />
            </CardContent>
          </Card>

          <CheckinCalendar />
        </aside>
      </div>
    </AppLayout>
  );
}
