"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TopicForm from "@/components/TopicForm";
import Header from "@/components/Header";
import { topicApi, Topic } from "@/api/topic";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export default function EditTopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadTopic = async () => {
      try {
        setLoading(true);
        const response = await topicApi.findBySlug(slug);
        if (response.success) {
          setTopic(response.data);
        } else {
          setError("Không tìm thấy topic");
        }
      } catch (err: any) {
        setError("Lỗi khi tải topic");
        toast.error("Không thể tải thông tin topic");
        console.error("Error loading topic:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header showTopics={false} />
        <main className="max-w-3xl mx-auto p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </>
    );
  }

  if (error || !topic) {
    return (
      <>
        <Header showTopics={false} />
        <main className="max-w-3xl mx-auto p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-4">
              {error || "Không tìm thấy topic"}
            </div>
            <a
              href="/topics"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Quay lại danh sách topics
            </a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showTopics={false} />
      <main className="max-w-3xl mx-auto p-6">
        <TopicForm 
          initialData={{ name: topic.name }} 
          slug={topic.slug}
        />
      </main>
    </>
  );
}