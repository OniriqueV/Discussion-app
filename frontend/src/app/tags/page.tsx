"use client";
import Header from "@/components/Header";
import TagTable from "@/components/TagTable";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function TagsPage() {
  useAuthRedirect("admin");
  return (
    <>
      <Header showTags={false} />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Danh sách Tags</h1>
          <a 
            href="/tags/add" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Thêm Tag
          </a>
        </div>
        <TagTable />
      </main>
    </>
  );
}