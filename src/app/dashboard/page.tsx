"use client";

import { redirect } from "next/navigation";

export default function DashboardRoot() {
  redirect("/dashboard/beranda");
  return null;
}
