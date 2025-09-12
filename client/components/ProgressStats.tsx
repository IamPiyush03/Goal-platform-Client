import { useQuery } from "@tanstack/react-query";
import { getOverallProgressApi } from "@/lib/goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar, CheckCircle } from "lucide-react";

export default function ProgressStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["overallProgress"],
    queryFn: getOverallProgressApi,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Goals",
      value: stats.totalGoals,
      icon: Target,
      color: "text-blue-600",
    },
    {
      title: "Completed Goals",
      value: stats.completedGoals,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Average Progress",
      value: `${stats.averageProgress}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Learning Velocity",
      value: stats.overallVelocity,
      icon: Calendar,
      color: "text-orange-600",
      fullWidth: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 3).map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {stats.weeklySummary}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {stats.totalMilestones} total milestones
            </Badge>
            <Badge variant="outline">
              {stats.completedMilestones} completed
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}