"use client";

import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type userRouter } from "@/server/api/routers/user";
import { type ColumnDef } from "@tanstack/react-table";
import { Edit3Icon, Ellipsis, TrashIcon } from "lucide-react";

export type Users = typeof userRouter.list._def.$types.output[0];

export const columns: ColumnDef<Users>[] = [
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
                // setSelectedUser(ctx.row.original);
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
                // setSelectedUser(ctx.row.original);
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
