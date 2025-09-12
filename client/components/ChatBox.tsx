import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatApi } from "@/lib/goals";

export function ChatBox({ goalId }: { goalId: string }) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatApi({ goalId, message: text });
      setMessages((m) => [...m, { role: "ai", text: res.reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 shadow-lg bg-white/70 dark:bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="space-y-3 max-h-72 overflow-auto">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Ask the AI tutor anything about this goal.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={
              m.role === "user"
                ? "inline-block rounded-2xl bg-primary text-primary-foreground px-3 py-2 animate-in fade-in-50 slide-in-from-right-2"
                : "inline-block rounded-2xl bg-secondary text-secondary-foreground px-3 py-2 animate-in fade-in-50 slide-in-from-left-2"
            }>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2 items-start">
        <Textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message" />
        <Button onClick={send} disabled={loading}>{loading ? "Sending..." : "Send"}</Button>
      </div>
    </div>
  );
}
