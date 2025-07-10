// src/app/topics/page.tsx
import TopicTable from "@/components/TopicTable";
import { topicsMock } from "@/mock/topics";
import Header from "@/components/Header";

export default function TopicsPage() {
  return (
    <>
      <Header showTopics={false} />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Danh sách Topic</h1>
          <a href="/topics/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Thêm</a>
        </div>
        <TopicTable topics={topicsMock} />
      </main>
    </>
  );
}
