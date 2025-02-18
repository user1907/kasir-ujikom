"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useBreadcrumb } from "@/components/providers/breadcrumb";

export default function UserManagement() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Manajemen Pengguna", href: "/dashboard/users" }
    ]);
  }, [setBreadcrumbs]);

  const users = api.user.list.useQuery();

  return (
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
            createDataAction={() => { console.log("Create user!"); }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
