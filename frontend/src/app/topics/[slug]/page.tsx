"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TopicDetail from "@/components/TopicDetail";
import { topicApi, Topic } from "@/api/topic";
import { toast } from "react-toastify";

export default function TopicDetailPage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Không tìm thấy chủ đề"}
          </h1>
          <p className="text-gray-600">Chủ đề bạn tìm kiếm không tồn tại.</p>
          <a
            href="/topics"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            Quay lại danh sách topics
          </a>
        </div>
      </div>
    );
  }

  // Pass topic ID to TopicDetail component
  return <TopicDetail topicId={topic.id} />;
}