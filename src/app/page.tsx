"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type z } from "zod";
import { LoginSchema } from "@/schemas/users";
import { toast } from "sonner";
import { navigate } from "@/components/navigate";

export default function Login() {
  const { mutate: login } = api.session.create.useMutation({
    onSuccess: async () => {
      toast.success("Logged in successfully");
      await navigate("/dashboard");
    },
    onError: (error) => {
      if (error.message === "NEXT_REDIRECT") return;
      toast.error(error.message);
    }
  });
  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  return (
    <main>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Image src="/icon.png" height={64} width={64} alt="Logo" />
            <h1 className="text-3xl font-bold">MyKasir</h1>
          </div>
          <Card className="w-auto">
            <CardHeader>
              <CardTitle>Login to MyKasir</CardTitle>
              <CardDescription>Login untuk masuk ke MyKasir</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(data => login(data))} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Login</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
