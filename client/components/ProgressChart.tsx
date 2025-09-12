import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getAllCheckinRecordsApi } from "@/lib/checkin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";

interface ProgressChartProps {
  goalId?: string;
  days?: number;
}

export default function ProgressChart({ goalId, days = 30 }: ProgressChartProps) {
  const { data: checkinRecords, isLoading } = useQuery({
    queryKey: ["checkinRecords", goalId],
    queryFn: getAllCheckinRecordsApi,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter records by goal if specified
  const filteredRecords = goalId
    ? checkinRecords?.filter(record =>
        typeof record.goalId === 'object'
          ? record.goalId._id === goalId
          : record.goalId === goalId
      ) || []
    : checkinRecords || [];

  // Generate data points for the last N days
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const chartData = dateRange.map(date => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayRecords = filteredRecords.filter(record =>
      format(new Date(record.checkinDate), "yyyy-MM-dd") === dateKey
    );

    // Use the latest progress update for the day, or 0 if no check-in
    const progress = dayRecords.length > 0
      ? Math.max(...dayRecords.map(r => r.progressUpdate || 0))
      : null;

    return {
      date: format(date, "MMM dd"),
      fullDate: dateKey,
      progress,
      checkins: dayRecords.length,
    };
  });

  // Fill in missing progress values with the last known value
  let lastKnownProgress = 0;
  const filledData = chartData.map(point => {
    if (point.progress !== null) {
      lastKnownProgress = point.progress;
    }
    return {
      ...point,
      progress: point.progress !== null ? point.progress : lastKnownProgress,
    };
  });

  const hasData = filledData.some(d => d.progress > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progress Trend ({days} days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filledData}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-md">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            Progress: {data.progress}%
                          </p>
                          {data.checkins > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Check-ins: {data.checkins}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#progressGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No progress data yet</p>
            <p className="text-sm text-muted-foreground">
              Start recording check-ins to see your progress trend
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}