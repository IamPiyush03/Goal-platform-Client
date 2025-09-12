import { useQuery } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import { getAllCheckinRecordsApi } from "@/lib/checkin";
import { CheckinRecord } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function CheckinCalendar() {
  const { data: checkinRecords, isLoading } = useQuery({
    queryKey: ["checkinRecords"],
    queryFn: getAllCheckinRecordsApi,
  });

  // Create a map of dates with check-ins
  const checkinDates = new Map<string, CheckinRecord[]>();
  if (checkinRecords) {
    checkinRecords.forEach((record) => {
      const dateKey = format(new Date(record.checkinDate), "yyyy-MM-dd");
      if (!checkinDates.has(dateKey)) {
        checkinDates.set(dateKey, []);
      }
      checkinDates.get(dateKey)!.push(record);
    });
  }

  // Function to check if a date has check-ins
  const hasCheckins = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return checkinDates.has(dateKey);
  };

  // Custom day content to show check-in indicators
  const modifiers = {
    hasCheckins: (date: Date) => hasCheckins(date),
  };

  const modifiersStyles = {
    hasCheckins: {
      backgroundColor: "#10b981",
      color: "white",
      fontWeight: "bold",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Check-in Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Check-in Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DayPicker
            mode="single"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
            showOutsideDays
          />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Legend</h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Days with check-ins</span>
            </div>
          </div>

          {checkinRecords && checkinRecords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Check-ins</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {checkinRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {typeof record.goalId === 'object' && record.goalId?.title
                          ? record.goalId.title
                          : "Unknown Goal"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(record.checkinDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {record.mood && (
                      <Badge variant="outline" className="text-xs">
                        {record.mood}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!checkinRecords || checkinRecords.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No check-ins recorded yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start checking in to see your progress on the calendar!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}