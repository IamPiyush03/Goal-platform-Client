import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const signupForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onLogin = async (values: LoginValues) => {
    setErr(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (e: any) {
      setErr("Invalid credentials");
    }
  };

  const onSignup = async (values: LoginValues) => {
    setErr(null);
    try {
      await signup(values.email, values.password);
      navigate("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Signup failed");
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-md">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Welcome to Stride</CardTitle>
            <CardDescription>Sign in to track goals and learn faster.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 pt-4">
                <form className="space-y-3" onSubmit={loginForm.handleSubmit(onLogin)}>
                  <div>
                    <label className="text-sm">Email</label>
                    <Input type="email" {...loginForm.register("email")} />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm">Password</label>
                    <Input type="password" {...loginForm.register("password")} />
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  {err && <p className="text-sm text-destructive">{err}</p>}
                  <Button type="submit" className="w-full">Login</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 pt-4">
                <form className="space-y-3" onSubmit={signupForm.handleSubmit(onSignup)}>
                  <div>
                    <label className="text-sm">Email</label>
                    <Input type="email" {...signupForm.register("email")} />
                    {signupForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm">Password</label>
                    <Input type="password" {...signupForm.register("password")} />
                    {signupForm.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  {err && <p className="text-sm text-destructive">{err}</p>}
                  <Button type="submit" className="w-full">Create account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
