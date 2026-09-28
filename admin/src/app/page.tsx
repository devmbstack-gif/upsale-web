import { API_URL } from "@/lib/api";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-100 px-6 font-sans">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        UPSale Admin
      </h1>
      <p className="max-w-md text-center text-zinc-600">
        Admin panel is ready. API base URL: {API_URL}
      </p>
    </main>
  );
}
