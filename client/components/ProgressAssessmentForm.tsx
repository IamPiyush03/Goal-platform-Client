import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { recordCheckinApi } from "@/lib/checkin";
import { listGoalsApi } from "@/lib/goals";
import { RecordCheckinRequest, GoalListItem } from "@shared/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ProgressAssessmentFormProps {
  trigger?: React.ReactNode;
  goalId?: string;
}

export default function ProgressAssessmentForm({ trigger, goalId }: ProgressAssessmentFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: listGoalsApi,
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<RecordCheckinRequest>({
    defaultValues: {
      goalId: goalId || "",
      mood: "",
      notes: "",
      progressUpdate: 0,
    }
  });

  const recordCheckin = useMutation({
    mutationFn: recordCheckinApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkinRecords"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Check-in recorded successfully!");
      setOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error("Failed to record check-in");
      console.error("Check-in error:", error);
    },
  });

  const onSubmit = (data: RecordCheckinRequest) => {
    if (!data.goalId) {
      toast.error("Please select a goal");
      return;
    }
    recordCheckin.mutate(data);
  };

  const watchedProgress = watch("progressUpdate");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Record Check-in
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Progress Check-in
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Goal Selection */}
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Select
              value={watch("goalId")}
              onValueChange={(value) => setValue("goalId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals?.map((goal: GoalListItem) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.goalId && (
              <p className="text-sm text-red-500">Please select a goal</p>
            )}
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <Label>How are you feeling?</Label>
            <RadioGroup
              value={watch("mood")}
              onValueChange={(value) => setValue("mood", value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="great" id="great" />
                <Label htmlFor="great">😊 Great</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good">🙂 Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="okay" id="okay" />
                <Label htmlFor="okay">😐 Okay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="struggling" id="struggling" />
                <Label htmlFor="struggling">😞 Struggling</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Progress Update */}
          <div className="space-y-2">
            <Label>Progress Update: {watchedProgress}%</Label>
            <Slider
              value={[watchedProgress || 0]}
              onValueChange={(value) => setValue("progressUpdate", value[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Quick Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="What's been working? Any challenges?"
              {...register("notes")}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={recordCheckin.isPending}
          >
            {recordCheckin.isPending ? "Recording..." : "Record Check-in"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}