"use client";

import { type AssertNotUndefined, type InferQueryResult } from "@/lib/utils";
import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { useEffect } from "react";
import { api } from "@/trpc/react";
// import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/numberFormat";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DateTime } from "luxon";

export default function UserManagement() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Beranda", href: "/dashboard" },
      { label: "Transaksi", href: "/dashboard/transaction" }
    ]);
  }, [setBreadcrumbs]);

  const transactions = api.transaction.list.useQuery();
  type Transaction = AssertNotUndefined<InferQueryResult<typeof transactions>>[0];
  // type TransactionDetail = Transaction["details"];

  // const transactionDetailColumns: ColumnDef<TransactionDetail>[] = [
  //   {
  //     accessorKey: "name"
  //   }
  // ];

  console.log(transactions.data);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="ID" />)
    },
    {
      accessorKey: "time",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Waktu" />),
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{DateTime.fromJSDate(row.original.time).toLocal().toFormat("dd LLL yyyy hh:mm")}</TooltipTrigger>
            <TooltipContent>
              <span>{DateTime.fromJSDate(row.original.time).toRelative({ locale: "id" })}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    {
      accessorKey: "user.name",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Nama Kasir" />)
    },
    {
      accessorKey: "customer.name",
      id: "customer.name",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Nama Pelanggan" />),
      cell: ({ row }) => row.original.customer?.name ?? "N/A"
    },
    {
      accessorKey: "details",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Detail" />),
      cell: ({ row }) => (
        <ul className="list-disc pl-5 ">
          {row.original.details.map((detail, index) => (
            <li key={index}>
              {detail.amount}
              x
              {" "}
              {detail.name}
              {" "}
              {formatCurrency(detail.price)}
            </li>
          ))}
        </ul>
      )
    },
    {
      accessorKey: "totalPrice",
      header: ({ column }) => (<DataTableColumnHeader column={column} title="Total harga" />),
      cell: ({ row }) => formatCurrency(row.original.totalPrice)
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat transaksi</CardTitle>
          <CardDescription>Cari dan lihat riwayat transaksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={transactions.data ?? []}
              isLoading={transactions.isLoading}
              filteredColumnName="customer.name"
            />
          </div>
        </CardContent>
      </Card>
      <Drawer>
        <DrawerContent>
          {/* <DataTable></DataTable> */}
        </DrawerContent>
      </Drawer>
    </>
  );
}
