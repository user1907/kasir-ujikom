import { Separator } from "@/components/ui/separator";

export default function NotFound() {
  return (
    <main>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold">404</h1>
          <Separator />
          <span className="block mt-2 text-2xl">Halaman tidak ditemukan</span>
        </div>
      </div>
    </main>
  );
}
