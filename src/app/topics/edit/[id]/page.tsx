// src/app/topics/edit/[id]/page.tsx
import TopicForm from "@/components/TopicForm";
import { getTopicById } from "@/mock/topics";
import Header from "@/components/Header";
import { use } from "react";

export default function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topic = getTopicById((id));

  if (!topic) {
    return (
      <>
        {/* <Header /> */}
        <div className="p-6 text-red-500">Không tìm thấy topic</div>
      </>
    );
  }

  return (
    <>
      {/* <Header /> */}
      <main className="max-w-3xl mx-auto p-6">
        <TopicForm initialData={{ name: topic.name }} />
      </main>
    </>
  );
}
