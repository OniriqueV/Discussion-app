"use client";
import Header from "@/components/Header";

export default function AccountPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header showAccount={false} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tài khoản</h2>
          <p>Nội dung account...</p>
        </div>
      </main>
    </div>
  );
}