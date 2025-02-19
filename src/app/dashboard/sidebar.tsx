"use client";

import { ChartColumn, LogOut, ShoppingCart, User2, Users2, Warehouse } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import Image from "next/image";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Kasir",
    url: "#",
    icon: ShoppingCart,
    levels: ["cashier"]
  },
  {
    title: "Transaksi & Pendapatan",
    url: "#",
    icon: ChartColumn,
    levels: ["cashier", "administrator"]
  },
  {
    title: "Barang",
    url: "#",
    icon: Warehouse,
    levels: ["cashier", "administrator"]
  },
  {
    title: "Pegawai",
    url: "/dashboard/users",
    icon: Users2,
    levels: ["administrator"]
  },
  {
    title: "Pelanggan",
    url: "/dashboard/customers",
    icon: Users2,
    levels: ["cashier", "administrator"]
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User2,
    levels: ["cashier", "administrator"]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();

  const session = api.session.read.useQuery(undefined, {
    retry: false,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000
  });

  const logout = api.session.delete.useMutation({
    onSuccess() {
      window.location.href = "/";
      toast.success("Berhasil logout.");
    },
    onError() {
      window.location.href = "/";
    }
  });

  if (session.isError) {
    window.location.href = "/";
    toast.error("Sesi anda telah berakhir, silahkan login kembali.");
    return null;
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="flex h-full flex-col"
    >
      <SidebarHeader>
        <SidebarMenuButton className="flex items-center justify-center">
          <Image src="/icon.png" width={48} height={48} alt="logo" />
          <h1
            hidden={state === "collapsed"}
            className="ml-2 text-3xl font-bold"
          >
            MyKasir
          </h1>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="flex-1 flex flex-col">
        <SidebarGroup className="flex-1 flex flex-col">
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {session.isLoading
                ? new Array(3).fill(null).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <Skeleton className="h-8 w-full" />
                    </SidebarMenuItem>
                  ))
                : items.filter(i => i.levels.includes(session.data!.level)).map(item => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter>
          {session.isLoading
            ? (
                <div className={`flex ${state === "collapsed" ? "flex-col items-center gap-2" : "items-center gap-2"}`}>
                  <Skeleton className={`${state === "collapsed" ? "h-6 w-6" : "h-8 w-8"} rounded-full`} />
                  {state !== "collapsed" && <Skeleton className="h-4 w-24" />}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      logout.mutate();
                    }}
                    className={`${state !== "collapsed" ? "ml-auto text-red-500" : "text-red-500"}`}
                  >
                    <LogOut />
                  </Button>
                </div>
              )
            : (
                <div
                  className={`flex ${
                    state === "collapsed" ? "flex-col items-center gap-2" : "items-center gap-2"
                  }`}
                >
                  <Avatar className={`${state === "collapsed" ? "h-6 w-6" : "h-8 w-8"}`}>
                    <AvatarImage
                      className="h-full w-full rounded-full object-cover"
                      src={`https://ui-avatars.com/api/?name=${session.data?.name}&size=${
                        state === "collapsed" ? 24 : 32
                      }`}
                    />
                  </Avatar>
                  {state === "expanded" && (
                    <span className="truncate max-w-[150px]">
                      {session.data?.name}
                      {" "}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      logout.mutate();
                    }}
                    className={`${state !== "collapsed" ? "ml-auto text-red-500" : "text-red-500"}`}
                  >
                    <LogOut />
                  </Button>
                </div>
              )}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
