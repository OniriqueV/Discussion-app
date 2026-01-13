"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TagForm from "@/components/TagForm";
import Header from "@/components/Header";
import { tagApi, Tag } from "@/api/tag";
import { toast } from "react-toastify";

export default function EditTagPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadTag = async () => {
      try {
        setLoading(true);
        const response = await tagApi.findBySlug(slug);
        if (response.success) {
          setTag(response.data);
        } else {
          setError("Không tìm thấy tag");
        }
      } catch (err: any) {
        setError("Lỗi khi tải tag");
        toast.error("Không thể tải thông tin tag");
        console.error("Error loading tag:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTag();
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

  if (error || !tag) {
    return (
      <>
        <Header showTopics={false} />
        <main className="max-w-3xl mx-auto p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-lg mb-4">
              {error || "Không tìm thấy tag"}
            </div>
            <a
              href="/tags"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Quay lại danh sách tags
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
        <TagForm 
          initialData={{ name: tag.name }} 
          slug={tag.slug}
        />
      </main>
    </>
  );
}
