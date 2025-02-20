"use client";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { useDialog } from "@/components/providers/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/numberFormat";
import { type InferQueryResult, type AssertNotUndefined } from "@/lib/utils";
import { api } from "@/trpc/react";
import { type ColumnDef } from "@tanstack/react-table";
import { MinusIcon, PlusIcon, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function CashierPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Beranda", href: "/dashboard" },
      { label: "Kasir", href: "/dashboard/cashier" }
    ]);
  }, [setBreadcrumbs]);

  const products = api.product.list.useQuery();
  const [nameFilter, setNameFilter] = useState<string>("");
  const filteredProducts = useMemo(() => {
    if (!products.data) return [];
    return products.data
      .filter(p => p.name.includes(nameFilter))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products.data, nameFilter]);
  type Product = typeof filteredProducts[0];
  const [productsInCart, setProductsInCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const addToCart = (product: Product) => {
    setProductsInCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.product.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) => {
          if (item.product.id === product.id) {
            return { ...item, quantity: item.quantity++ };
          }
          return item;
        });
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (product: Product) => {
    setProductsInCart((prevCart) => {
      const existingProduct = prevCart.find(item => item.product.id === product.id);
      if (existingProduct && existingProduct.quantity > 1) {
        return prevCart.map((item) => {
          if (item.product.id === product.id) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });
      }
      return prevCart.filter(item => item.product.id !== product.id);
    });
  };

  const renderSkeletons = () => (
    <>
      {[...Array(8) as void[]].map((_, index) => (
        <Skeleton
          key={index}
          className="p-4 border rounded-lg shadow-sm min-h-[25vh] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-24 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
          <Skeleton className="w-full h-10 mt-4" />
        </Skeleton>
      ))}
    </>
  );

  const renderProductCard = (product: Product, index: number) => (
    <div
      key={index}
      className="
        p-4 border rounded-lg shadow-sm min-h-[25vh] flex flex-col justify-between
      "
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">{product.name}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>{formatCurrency(product.price)}</span>
          <span className="text-sm text-muted-foreground">
            Stok:
            {" "}
            {product.stock}
          </span>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => addToCart(product)}
      >
        <PlusIcon />
      </Button>
    </div>
  );

  const totalAmount = productsInCart.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );
  const changeAmount = Math.max(paymentAmount - totalAmount, 0);

  const customerDialog = useDialog();
  const customerList = api.customer.list.useQuery();
  type Customer = AssertNotUndefined<InferQueryResult<typeof customerList>>[0];
  const customerColumns: ColumnDef<Customer>[] = [
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
    }
  ];

  return (
    <>
      <Card className="flex flex-col h-full" id="main-content">
        <CardHeader>
          <CardTitle>Kasir</CardTitle>
          <CardDescription>Layani pelanggan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="flex flex-row gap-1 h-full">
            <Card className="w-3/4 h-full" id="product-list">
              <CardHeader>
                <CardTitle>Katalog Produk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative flex items-center gap-4 mb-4">
                  <Input
                    className="pr-10" // extra right padding for the icon
                    placeholder="Cari produk..."
                    onChange={e => setNameFilter((e.target as HTMLInputElement).value)}
                  />
                  <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.isLoading
                    ? renderSkeletons()
                    : filteredProducts.length
                      ? filteredProducts.map((product, i) => renderProductCard(product, i))
                      : null}
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col h-full" id="cart">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>Keranjang</span>
                  <Button
                    className="ml-auto"
                    variant="destructive"
                    onClick={() => {
                      setProductsInCart([]);
                      setPaymentAmount(0);
                    }}
                  >
                    Kosongkan keranjang
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto">
                <Table className="h-full">
                  <TableHeader>
                    <TableRow>
                      <TableCell>Produk</TableCell>
                      <TableCell>Harga</TableCell>
                      <TableCell className="text-center">Jumlah</TableCell>
                      <TableCell>Subtotal</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsInCart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{formatCurrency(item.product.price)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              onClick={() => removeFromCart(item.product)}
                            >
                              <MinusIcon />
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              onClick={() => addToCart(item.product)}
                            >
                              <PlusIcon />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency((Number(item.product.price) * item.quantity).toString())}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="w-full mt-auto">
                <div className="flex flex-col w-full">
                  <div className="flex justify-between w-full">
                    <span>Total:</span>
                    <span className="font-semibold">
                      {formatCurrency(totalAmount.toString())}
                    </span>
                  </div>
                  <div className="flex justify-between w-full">
                    <span>Pembayaran:</span>
                    <span className="font-semibold">
                      {formatCurrency(paymentAmount.toString())}
                    </span>
                  </div>
                  {changeAmount > 0 && (
                    <div className="flex justify-between w-full">
                      <span>Kembalian:</span>
                      <span className="font-semibold">
                        {formatCurrency(changeAmount.toString())}
                      </span>
                    </div>
                  )}
                  <div className="flex space-x-4 w-full mt-3">
                    <Input
                      placeholder="Masukkan pembayaran"
                      className="flex-grow"
                      type="number"
                      onChange={e => setPaymentAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex w-full mt-3 gap-2">
                    <Button className="flex-1" onClick={customerDialog.trigger}>Tambah data pelanggan</Button>
                    <Button
                      className="flex-1"
                      disabled={paymentAmount < totalAmount || totalAmount === 0}
                    >
                      Bayar
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Dialog {...customerDialog.props}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cari pelanggan</DialogTitle>
          </DialogHeader>
          <DataTable columns={customerColumns} data={customerList.data ?? []} isLoading={customerList.isLoading} />
        </DialogContent>
      </Dialog>
    </>
  );
}
