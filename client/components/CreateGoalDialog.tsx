import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  timeline: z.string().min(1, "Timeline is required"),
});

type Values = z.infer<typeof schema>;

import type { CreateGoalResponse } from "@shared/api";

export function CreateGoalDialog({ onCreate }: { onCreate: (v: Values) => Promise<CreateGoalResponse> }) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", description: "", timeline: "3 months" } });

  const submit = form.handleSubmit(async (v) => {
    await onCreate(v);
    form.reset({ title: "", description: "", timeline: "3 months" });
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Create a goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3" onSubmit={submit}>
          <div>
            <label className="text-sm">Title</label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea rows={3} {...form.register("description")} />
          </div>
          <div>
            <label className="text-sm">Suggested timeline</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                "1 month",
                "3 months",
                "6 months",
              ].map((t) => (
                <Button key={t} type="button" variant={form.watch("timeline") === t ? "default" : "outline"} onClick={() => form.setValue("timeline", t)}>
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm">Custom timeline</label>
            <Input {...form.register("timeline")} />
            {form.formState.errors.timeline && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.timeline.message}</p>
            )}
          </div>
          <Button type="submit">Create</Button>
        </form>
      </CardContent>
    </Card>
  );
}
