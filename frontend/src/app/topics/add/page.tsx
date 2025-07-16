// src/app/topics/add/page.tsx
import TopicForm from "@/components/TopicForm";
import Header from "@/components/Header";

export default function AddTopicPage() {
  return (
    <>
      {/* <Header /> */}
      <main className="max-w-3xl mx-auto p-6">
        <TopicForm />
      </main>
    </>
  );
}
