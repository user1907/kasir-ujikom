"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { UserUpdateSchema } from "@/schemas";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { userLevel } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profile", href: "/dashboard/profile" }
    ]);
  }, [setBreadcrumbs]);

  const currentUser = api.user.read.useQuery();

  const { mutate: updateUser } = api.user.update.useMutation({
    onSuccess() {
      toast.success("Profile berhasil diupdate!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });

  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      level: "cashier"
    }
  });

  useEffect(() => {
    if (currentUser.isSuccess) {
      form.reset(currentUser.data);
    }
  }, [currentUser.isSuccess, currentUser.data, form]);

  if (currentUser.isError) {
    toast.error("Anda tidak memiliki sesi aktif, silahkan login terlebih dahulu!");
    window.location.href = "/";
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update data profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(data => updateUser({ ...data, id: currentUser.data!.id, level: currentUser.data!.level }))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Level
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button disabled={true} variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                          {field.value ? userLevel.enumValues.find(v => v === field.value) : "Select level"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandList>
                          <CommandEmpty>Invalid user level</CommandEmpty>
                          <CommandGroup>
                            {userLevel.enumValues.map(level => (
                              <CommandItem
                                value={level}
                                key={level}
                                onSelect={() => {
                                  form.setValue("level", level);
                                }}
                                className="flex items-center justify-between px-4 py-2"
                              >
                                <span>{level}</span>
                                <Check
                                  className={cn("ml-2", level === field.value ? "opacity-100" : "opacity-0")}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={currentUser.isLoading} type="submit">Simpan</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
