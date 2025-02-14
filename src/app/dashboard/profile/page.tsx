"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profile", href: "/dashboard/profile" }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Input />
        </div>
      </CardContent>
    </Card>
  );
}
