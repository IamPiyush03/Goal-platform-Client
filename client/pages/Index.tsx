import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <AppLayout>
      <section className="grid lg:grid-cols-2 gap-10 items-center animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground bg-background/60">
            Goal Achievement Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Learn faster and hit goals with AI guidance
          </h1>
          <p className="text-muted-foreground text-lg">
            Stride helps you create goals, break them into milestones, chat with an AI tutor, and track progress with beautiful visuals.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/auth">Get started</Link></Button>
            <Button variant="outline" asChild><Link to="/dashboard">View dashboard</Link></Button>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            <li className="rounded-md border p-3 bg-card">Authenticate securely</li>
            <li className="rounded-md border p-3 bg-card">Create & manage goals</li>
            <li className="rounded-md border p-3 bg-card">AI tutor chat</li>
            <li className="rounded-md border p-3 bg-card">Visual progress tracking</li>
          </ul>
        </div>
        <div className="relative">
          <div className="rounded-xl border bg-white shadow-xl p-6">
            <div className="flex justify-between mb-4">
              <div className="h-2 w-20 rounded bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="text-xs text-muted-foreground">Demo</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium mb-2">Goal: Learn ML</div>
                <div className="h-2 w-full bg-secondary rounded">
                  <div className="h-2 w-1/3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded" />
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium mb-2">Goal: Web3</div>
                <div className="h-2 w-full bg-secondary rounded">
                  <div className="h-2 w-2/3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded" />
                </div>
              </div>
              <div className="col-span-2 rounded-lg border p-3">
                <div className="text-sm font-medium mb-2">AI Tutor</div>
                <div className="text-xs text-muted-foreground">How do I start with linear regression? → Focus on data prep and gradient descent.</div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-2 -z-10 blur-2xl opacity-50 bg-[radial-gradient(circle_at_20%_20%,#6366f1,transparent_40%),radial-gradient(circle_at_80%_30%,#8b5cf6,transparent_40%)]" />
        </div>
      </section>
    </AppLayout>
  );
}
