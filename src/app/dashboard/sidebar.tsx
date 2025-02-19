"use client";

import { HandCoins, History, Home, LogOut, User2, Users2, Warehouse } from "lucide-react";

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
    title: "Beranda",
    url: "/dashboard/beranda",
    icon: Home
  },
  {
    title: "Transaksi",
    url: "#",
    icon: HandCoins
  },
  {
    title: "Riwayat Transaksi",
    url: "#",
    icon: History
  },
  {
    title: "Pendataan Barang",
    url: "#",
    icon: Warehouse
  },
  {
    title: "Manajemen Pengguna",
    url: "/dashboard/users",
    icon: Users2,
    isAdmin: true
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User2
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
              {items.filter(i => i.isAdmin === true ? session.data?.level === "administrator" : true).map(item => (
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
