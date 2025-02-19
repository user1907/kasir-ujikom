"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3Icon, Ellipsis } from "lucide-react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { type AssertNotUndefined, type QueryResultType } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
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
import { CustomerCreateSchema, CustomerUpdateSchema } from "@/schemas";
import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useDialog } from "@/components/providers/dialog";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserManagement() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Beranda", href: "/dashboard" },
      { label: "Pelanggan", href: "/dashboard/customers" }
    ]);
  }, [setBreadcrumbs]);

  const customers = api.customer.list.useQuery();
  type Customer = AssertNotUndefined<QueryResultType<typeof customers>>[0];
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const createDialog = useDialog();
  const { mutate: createCustomer } = api.customer.create.useMutation({
    async onSuccess() {
      await customers.refetch();
      createDialog.dismiss();
      toast.success("Pelanggan berhasil ditambahkan!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });
  const createCustomerForm = useForm<z.infer<typeof CustomerCreateSchema>>({
    resolver: zodResolver(CustomerCreateSchema),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: ""
    }
  });
  const updateDialog = useDialog();
  const updateCustomerForm = useForm<z.infer<typeof CustomerUpdateSchema>>({
    resolver: zodResolver(CustomerUpdateSchema),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: ""
    }
  });
  const { mutate: updateCustomer } = api.customer.update.useMutation({
    async onSuccess() {
      await customers.refetch();
      updateDialog.dismiss();
      toast.success("Pelanggan berhasil diupdate!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="ID" />)
    },
    {
      accessorKey: "name",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Nama" />)
    },
    {
      accessorKey: "address",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Alamat" />)
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Nomor Telepon" />)
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
                  setSelectedCustomer(ctx.row.original);
                  updateCustomerForm.reset(ctx.row.original);
                  updateDialog.trigger();
                }}
              >
                <Edit3Icon />
                Edit
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
          <CardTitle>Manajemen Pelanggan</CardTitle>
          <CardDescription>Kelola pelanggan toko</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="container mx-auto py-10">
            <DataTable
              columns={columns}
              data={customers.data ?? []}
              isLoading={customers.isLoading}
              createDataText="Tambah Pelanggan"
              createDataAction={() => {
                createCustomerForm.reset();
                createDialog.trigger();
              }}
            />
          </div>
        </CardContent>
      </Card>
      <Dialog {...createDialog.props}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Buat pelanggan baru
            </DialogTitle>
            <DialogDescription>Isi detail pelanggan baru yang akan ditambahkan ke sistem.</DialogDescription>
          </DialogHeader>
          <Form {...createCustomerForm}>
            <form onSubmit={createCustomerForm.handleSubmit(data => createCustomer(data))} className="space-y-4">
              <FormField
                control={createCustomerForm.control}
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
                control={createCustomerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Alamat
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createCustomerForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nomor telepon
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
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
              Ubah data pelanggan
            </DialogTitle>
            <DialogDescription>Ubah data pelanggan yang diinginkan untuk disimpan</DialogDescription>
          </DialogHeader>
          <Form {...updateCustomerForm}>
            <form onSubmit={updateCustomerForm.handleSubmit(data => updateCustomer({ ...data, id: selectedCustomer!.id }))} className="space-y-4">
              <FormField
                control={updateCustomerForm.control}
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
                control={updateCustomerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Alamat
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateCustomerForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nomor telepon
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
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
    </>
  );
}
