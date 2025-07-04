// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
    } else {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.google.accounts.id.disableAutoSelect(); // One Tap logout
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center bg-white p-4 rounded shadow">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <main className="mt-6">
        <h2 className="text-2xl font-semibold">Chào mừng 👋</h2>
        <p className="mt-2">Tên người dùng: <b>{user?.credential?.substring(0, 10)}...</b></p>
        <p className="mt-2 text-sm text-gray-500">
          (Hiển thị demo — credential là chuỗi JWT từ Google)
        </p>
      </main>
    </div>
  );
}
