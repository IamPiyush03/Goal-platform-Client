import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { GoalListItem } from "@shared/api";

export function GoalCard({ goal, onDelete }: { goal: GoalListItem; onDelete: (id: string) => void }) {
  return (
    <Card className="transition-all hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{goal.title}</span>
          <span className="text-xs text-muted-foreground">{goal.progress}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={goal.progress} />
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to={`/goal/${goal.id}`}>Open</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(goal.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
