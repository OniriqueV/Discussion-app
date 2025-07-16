// src/app/topics/page.tsx
import TagTable from "@/components/TagTable";
import { tagsMock } from "@/mock/tags";
import Header from "@/components/Header";

export default function TagsPage() {
  return (
    <>
      <Header showTags={false} />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Danh sách Tags</h1>
          <a href="/tags/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Thêm</a>
        </div>
        <TagTable tags={tagsMock} />
      </main>
    </>
  );
}
