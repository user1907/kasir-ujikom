"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export default function Dashboard() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Beranda", href: "/dashboard/beranda" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Dashboard content</p>
      </CardContent>
    </Card>
  );
}
