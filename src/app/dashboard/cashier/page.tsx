"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/numberFormat";
import { api } from "@/trpc/react";
import { type ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
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

  const renderSkeletons = () => (
    <>
      {[...Array(8) as void[]].map((_, index) => (
        <Skeleton
          key={index}
          className="p-4 border rounded-lg shadow-sm min-h-[20vh] w-full flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="w-24 h-5" />
            </div>
            <Skeleton className="w-full h-4" />
          </div>
          <Skeleton className="w-32 h-4 mt-2" />
        </Skeleton>
      ))}
    </>
  );

  const renderProductCard = (product: Product, index: number) => (
    <div
      key={index}
      className="
        p-4 border rounded-lg shadow-sm
        min-h-[20vh] w-full
        flex flex-col justify-between
        hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground focus-visible:ring-2 transition duration-200
      "
      onClick={() => addToCart(product)}
    >
      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-l">{product.name}</span>
          <span className="text-xl ml-auto">{formatCurrency(product.price)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground mt-2">
          Stok:
          {" "}
          {product.stock}
        </span>
      </div>
    </div>
  );

  const columns: ColumnDef<Product>[] = [
    {
      header: "Produk",
      accessorKey: "name"
    },
    {
      header: "Harga",
      accessorKey: "price",
      cell: ({ row }) => formatCurrency(row.original.price)
    },
    {
      header: "Jumlah"
    },
    {
      header: "Subtotal",
      cell: ({ row }) => formatCurrency(row.original.price)
    }
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Kasir</CardTitle>
        <CardDescription>Layani pelanggan</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="flex flex-row gap-4 h-full">
          <Card className="w-3/4 h-full">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.isLoading
                  ? renderSkeletons()
                  : filteredProducts.length
                    ? filteredProducts.map((product, i) => renderProductCard(product, i))
                    : null}
              </div>
            </CardContent>
          </Card>
          <Card className="h-full flex-grow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span>Keranjang</span>
                <Button className="ml-auto" onClick={() => setProductsInCart([])}>Kosongkan keranjang</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableCell>Produk</TableCell>
                    <TableCell>Harga</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Subtotal</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsInCart.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{formatCurrency(item.product.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency((Number(item.product.price) * item.quantity).toString())}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* <div className="mt-4">
                <span className="font-semibold">Total: </span>
                <span>{formatCurrency(productsInCart.reduce((total, item) => total + item.product.price * item.quantity, 0))}</span>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
