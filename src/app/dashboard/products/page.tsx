"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3Icon, Ellipsis, TrashIcon } from "lucide-react";
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
import { ProductCreateSchema, ProductUpdateSchema } from "@/schemas";
import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useDialog } from "@/components/providers/dialog";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/numberFormat";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function UserManagement() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Beranda", href: "/dashboard" },
      { label: "Produk", href: "/dashboard/products" }
    ]);
  }, [setBreadcrumbs]);

  const products = api.product.list.useQuery({ includeArchived: true });
  type Product = AssertNotUndefined<QueryResultType<typeof products>>[0];
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const createDialog = useDialog();
  const { mutate: createProduct } = api.product.create.useMutation({
    async onSuccess() {
      await products.refetch();
      createDialog.dismiss();
      toast.success("Produk berhasil ditambahkan!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });
  const createProductForm = useForm<z.infer<typeof ProductCreateSchema>>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: {
      name: "",
      price: "0",
      stock: 0
    }
  });
  const updateDialog = useDialog();
  const updateProductForm = useForm<z.infer<typeof ProductUpdateSchema>>({
    resolver: zodResolver(ProductUpdateSchema),
    defaultValues: {
      name: "",
      price: "0",
      stock: 0,
      archived: false
    }
  });
  const { mutate: updateProduct } = api.product.update.useMutation({
    async onSuccess() {
      await products.refetch();
      updateDialog.dismiss();
      toast.success("Produk berhasil diupdate!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });
  const { mutate: deleteProduct } = api.product.delete.useMutation({
    async onSuccess() {
      await products.refetch();
      deleteDialog.dismiss();
      toast.success("Produk berhasil diarsipkan!");
    },
    onError(error) {
      toast.error(error.message);
    }
  });
  const deleteDialog = useDialog();

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="ID" />)
    },
    {
      accessorKey: "name",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Nama" />)
    },
    {
      accessorKey: "price",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Harga" />),
      cell: ({ row }) => formatCurrency(row.original.price)
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Stok" />)
    },
    {
      accessorKey: "archived",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Di Arsip?" />)
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
                  setSelectedProduct(ctx.row.original);
                  updateProductForm.reset(ctx.row.original);
                  updateDialog.trigger();
                }}
              >
                <Edit3Icon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600"
                onClick={() => {
                  setSelectedProduct(ctx.row.original);
                  deleteDialog.trigger();
                }}
              >
                <TrashIcon />
                Arsip
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
          <CardTitle>Manajemen Produk</CardTitle>
          <CardDescription>Kelola produk toko</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={products.data ?? []}
              isLoading={products.isLoading}
              createDataText="Tambah Produk"
              createDataAction={() => {
                createProductForm.reset();
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
              Buat produk baru
            </DialogTitle>
            <DialogDescription>Isi detail produk baru yang akan ditambahkan ke sistem.</DialogDescription>
          </DialogHeader>
          <Form {...createProductForm}>
            <form onSubmit={createProductForm.handleSubmit(data => createProduct(data))} className="space-y-4">
              <FormField
                control={createProductForm.control}
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
                control={createProductForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Harga
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm">Rp.</span>
                        <Input
                          type="number"
                          {...field}
                          className="pl-10" // Adjust padding to make space for the prefix
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createProductForm.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Stok
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
              Ubah data produk
            </DialogTitle>
            <DialogDescription>Ubah data produk yang diinginkan untuk disimpan</DialogDescription>
          </DialogHeader>
          <Form {...updateProductForm}>
            <form onSubmit={updateProductForm.handleSubmit(data => updateProduct({ ...data, id: selectedProduct!.id }))} className="space-y-4">
              <FormField
                control={updateProductForm.control}
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
                control={updateProductForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Harga
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm">Rp.</span>
                        <Input
                          type="number"
                          {...field}
                          className="pl-10" // Adjust padding to make space for the prefix
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateProductForm.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Stok
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
            <AlertDialogTitle>Arsip Pegawai</AlertDialogTitle>
            <AlertDialogDescription>
              Apa kamu yakin ingin mengarsip Produk
              {" "}
              {selectedProduct?.name}
              ?
              {" "}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteProduct({ id: selectedProduct!.id })}>Arsip</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
