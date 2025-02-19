"use client";

import { AppSidebar } from "@/app/dashboard/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import Cookies from "js-cookie";
import { useEffect, useState, type ReactNode } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { BreadcrumbDisplay, BreadcrumbProvider } from "@/components/providers/breadcrumb";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sidebarCookie = Cookies.get("sidebar_state") === "true";
    setIsSidebarOpen(sidebarCookie);
    setMounted(true);
  }, []);

  if (!mounted) {
    // Optionally, you can render a loading state here
    return null;
  }

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <BreadcrumbDisplay />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="ml-auto">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Terang
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Gelap
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  Sistem
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-2">{children}</div>
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
