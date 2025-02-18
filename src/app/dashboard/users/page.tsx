"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis, Edit3Icon, TrashIcon } from "lucide-react";
import { type AssertNotUndefined, type QueryResultType } from "@/lib/utils";

export default function UserManagement() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Manajemen Pengguna", href: "/dashboard/users" }
    ]);
  }, [setBreadcrumbs]);

  const users = api.user.list.useQuery();
  type User = AssertNotUndefined<QueryResultType<typeof users>>[0];
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
                // updateUserForm.reset({
                //   name: ctx.row.original.name,
                //   password: ""
                // });
                // updateDialog.trigger();
                }}
              >
                <Edit3Icon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600"
                onClick={() => {
                  setSelectedUser(ctx.row.original);
                // deleteDialog.trigger();
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
            createDataAction={() => { console.log("Create user!"); }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
