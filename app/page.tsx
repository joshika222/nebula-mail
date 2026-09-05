import { cookies } from "next/headers";
import Home from "@/components/HomeShell";

export default async function Page() {
  const cookieStore = await cookies();
  const isConnected = !!cookieStore.get("gmail_access_token");

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50">
        <h1 className="text-2xl font-semibold">Nebula Mail</h1>
        
          <a href="/api/auth/google"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          Connect Gmail
        </a>
      </main>
    );
  }

  return <Home />;
}