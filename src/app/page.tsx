"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex w-full flex-col items-center gap-4">
          <div>
            <Image src="/icon.png" height={64} width={64} alt="Logo" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Login to MyKasir</CardTitle>
              <CardDescription>Login untuk masuk ke MyKasir</CardDescription>
            </CardHeader>
            <CardContent>

            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
