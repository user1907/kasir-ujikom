"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type InferQueryResult, type AssertNotUndefined } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useEffect } from "react";

export default function DashboardRoot() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Beranda", href: "/dashboard" }
    ]);
  }, [setBreadcrumbs]);

  const transactions = api.transaction.list.useQuery();

  return (
    <Card className="flex-grow">
      <CardHeader>
        <CardTitle>Beranda</CardTitle>
        <CardDescription>Detail transaksi terbaru</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex gap-1 h-full">
          <Card className="flex flex-grow">
            <CardHeader>
              <CardTitle>Ringkasan penjualan</CardTitle>
              <CardDescription>Ringkasan penjualan 7 hari terakhir</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
            </CardContent>
          </Card>
          <Card className="flex flex-grow">
            <CardHeader>
              <CardTitle>Aktivitas terbaru</CardTitle>
              <CardDescription>Ringkasan 30 aktivitas terakhir</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
