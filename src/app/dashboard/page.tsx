"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { useEffect } from "react";

export default function DashboardRoot() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Beranda", href: "/dashboard" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <h1>Hello World</h1>
  );
}
