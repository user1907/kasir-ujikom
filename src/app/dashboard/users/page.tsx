"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Edit3Icon, Ellipsis, TrashIcon } from "lucide-react";
import { type ControllerRenderProps, type FieldValues, type Path, type PathValue, useForm, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { type AssertNotUndefined, cn, type QueryResultType } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserCreateSchema, UserUpdateSchema } from "@/schemas";
import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useDialog } from "@/components/providers/dialog";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { userLevel } from "@/server/db/schema";
import { Badge } from "@/components/ui/badge";

function UserLevelSelection<T extends FieldValues>({ field, form }: { field: ControllerRenderProps<T>, form: UseFormReturn<T> }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value
              ? userLevel.enumValues.find(
                  level => level === field.value
                )
              : "Pilih level user"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {userLevel.enumValues.map(level => (
                <CommandItem
                  value={level}
                  key={level}
                  onSelect={() => {
                    form.setValue(field.name, level as PathValue<T, Path<T>>);
                  }}
                >
                  {level}
                  <Check
                    className={cn(
                      "ml-auto",
                      level === field.value
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
      { label: "Beranda", href: "/dashboard" },
      { label: "Pegawai", href: "/dashboard/users" }
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
      level: "cashier"
    }
  });
  const updateDialog = useDialog();
  const updateUserForm = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      level: "cashier"
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
                  updateUserForm.reset(ctx.row.original);
                  updateDialog.trigger();
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
                      <UserLevelSelection field={field} form={createUserForm} />
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
      <Dialog {...updateDialog.props}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Ubah data pengguna
            </DialogTitle>
            <DialogDescription>Ubah data pengguna yang diinginkan untuk disimpan</DialogDescription>
          </DialogHeader>
          <Form {...updateUserForm}>
            <form onSubmit={updateUserForm.handleSubmit(data => updateUser({ ...data, id: selectedUser!.id }))} className="space-y-4">
              <FormField
                control={updateUserForm.control}
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
                control={updateUserForm.control}
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
                control={updateUserForm.control}
                name="level"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Level
                      </FormLabel>
                      <UserLevelSelection field={field} form={updateUserForm} />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={updateUserForm.control}
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
