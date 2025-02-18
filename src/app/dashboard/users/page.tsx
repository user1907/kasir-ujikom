"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis, Edit3Icon, TrashIcon, ChevronsUpDown, Command, Check } from "lucide-react";
import { cn, type AssertNotUndefined, type QueryResultType } from "@/lib/utils";
import { useDialog } from "@/components/providers/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type FieldValues, type ControllerRenderProps, type UseFormReturn, type PathValue, type Path } from "react-hook-form";
import { useForm } from "react-hook-form";
import { UserCreateSchema, UserUpdateSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { userLevel } from "@/server/db/schema";
import { CommandEmpty, CommandGroup, CommandList } from "@/components/ui/command";
import { CommandItem } from "cmdk";

function UserLevelsSelection<T extends FieldValues>({ field, form }: { field: ControllerRenderProps<T>, form: UseFormReturn<T> }) {
  const languages = [
    { label: "English", value: "en" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Spanish", value: "es" },
    { label: "Portuguese", value: "pt" },
    { label: "Russian", value: "ru" },
    { label: "Japanese", value: "ja" },
    { label: "Korean", value: "ko" },
    { label: "Chinese", value: "zh" }
  ] as const;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-[200px] justify-between",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value
              ? languages.find(
                language => language.value === field.value
              )?.label
              : "Select language"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {languages.map(language => (
                <CommandItem
                  value={language.label}
                  key={language.value}
                  onSelect={() => {
                    form.setValue(field.name, language.value as PathValue<T, Path<T>>);
                  }}
                >
                  {language.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      language.value === field.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function UserManagement() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Manajemen Pengguna", href: "/dashboard/users" }
    ]);
  }, [setBreadcrumbs]);

  const users = api.user.list.useQuery();
  type User = AssertNotUndefined<QueryResultType<typeof users>>[0];
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const createDialog = useDialog();
  const { mutate: createUser } = api.user.create.useMutation({
    async onSuccess() {
      await users.refetch();
      createDialog.dismiss();
      toast.success("Pengguna berhasil ditambahkan!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });
  const createUserForm = useForm<z.infer<typeof UserCreateSchema>>({
    resolver: zodResolver(UserCreateSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      level: "user"
    }
  });
  const updateDialog = useDialog();
  const updateUserForm = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      level: "user"
    }
  });
  const { mutate: updateUser } = api.user.update.useMutation({
    async onSuccess() {
      await users.refetch();
      updateDialog.dismiss();
      toast.success("Pengguna berhasil diupdate!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });
  const { mutate: deleteUser } = api.user.delete.useMutation({
    async onSuccess() {
      await users.refetch();
      deleteDialog.dismiss();
      toast.success("Pengguna berhasil dihapus!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });
  const deleteDialog = useDialog();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="ID" />)
    },
    {
      accessorKey: "username",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Username" />)
    },
    {
      accessorKey: "name",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Nama" />)
    },
    {
      accessorKey: "level",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Level" />),
      cell: ({ row }) => {
        return <Badge>{row.getValue("level")}</Badge>;
      }
    },
    {
      id: "actions",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Aksi" />),
      cell: ctx => (
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent"
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedUser(ctx.row.original);
                // updateUserForm.reset({
                //   name: ctx.row.original.name,
                //   password: ""
                // });
                // updateDialog.trigger();
                }}
              >
                <Edit3Icon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600"
                onClick={() => {
                  setSelectedUser(ctx.row.original);
                  deleteDialog.trigger();
                }}
              >
                <TrashIcon />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Pengguna</CardTitle>
          <CardDescription>Kelola pengguna yang dapat mengakses aplikasi ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="container mx-auto py-10">
            <DataTable
              columns={columns}
              data={users.data ?? []}
              isLoading={users.isLoading}
              createDataText="Tambah Pengguna"
              createDataAction={createDialog.trigger}
            />
          </div>
        </CardContent>
      </Card>
      <Dialog {...createDialog.props}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Buat pengguna baru
            </DialogTitle>
            <DialogDescription>Isi detail pengguna baru yang akan ditambahkan ke sistem.</DialogDescription>
          </DialogHeader>
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit(data => createUser(data))} className="space-y-4">
              <FormField
                control={createUserForm.control}
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
                control={createUserForm.control}
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
                control={createUserForm.control}
                name="level"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Level
                      </FormLabel>
                      <UserLevelsSelection field={field} form={createUserForm} />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={createUserForm.control}
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
              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog {...deleteDialog.props}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apa kamu yakin ingin menghapus pengguna
              {" "}
              {selectedUser?.name}
              ?
              {" "}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteUser({ id: selectedUser!.id })}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
