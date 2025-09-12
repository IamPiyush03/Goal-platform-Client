import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input"; // Added missing import
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCheckinConfigApi, updateCheckinConfigApi } from "@/lib/checkin";
import { CheckinConfig, UpdateCheckinConfigRequest } from "@shared/api";
import { useToast } from "@/components/ui/use-toast";

const CheckinSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checkinConfig, isLoading, isError } = useQuery<CheckinConfig, Error>({
    queryKey: ['checkinConfig'],
    queryFn: getCheckinConfigApi,
  });

  const updateConfigMutation = useMutation<CheckinConfig, Error, UpdateCheckinConfigRequest>({
    mutationFn: updateCheckinConfigApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['checkinConfig'], data);
      toast({
        title: "Check-in settings updated!",
        description: `Next check-in: ${new Date(data.nextCheckin!).toLocaleString()}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (checkinConfig) {
      updateConfigMutation.mutate({
        interval: checkinConfig.interval,
        time: checkinConfig.time,
        remindersEnabled: checkinConfig.remindersEnabled,
      });
    }
  };

  if (isLoading) return <div>Loading settings...</div>;
  if (isError) return <div>Error loading settings.</div>;
  if (!checkinConfig) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in Settings</CardTitle>
        <CardDescription>Configure how often you want to check in on your goals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="interval">Check-in Interval</Label>
          <Select
            value={checkinConfig.interval}
            onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
              queryClient.setQueryData(['checkinConfig'], { ...checkinConfig, interval: value })
            }
          >
            <SelectTrigger id="interval">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="time">Check-in Time</Label>
          <Input
            id="time"
            type="time"
            value={checkinConfig.time}
            onChange={(e) =>
              queryClient.setQueryData(['checkinConfig'], { ...checkinConfig, time: e.target.value })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="reminders">Enable Reminders</Label>
          <Switch
            id="reminders"
            checked={checkinConfig.remindersEnabled}
            onCheckedChange={(checked) =>
              queryClient.setQueryData(['checkinConfig'], { ...checkinConfig, remindersEnabled: checked })
            }
          />
        </div>

        <Button onClick={handleSave} disabled={updateConfigMutation.isPending}>
          {updateConfigMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>

        {checkinConfig.nextCheckin && (
          <p className="text-sm text-muted-foreground">
            Next check-in: {new Date(checkinConfig.nextCheckin).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckinSettings;