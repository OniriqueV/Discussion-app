"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { topicApi } from "@/api/topic";
import { useState } from "react";

interface TopicFormProps {
  initialData?: { name: string };
  slug?: string; // cho edit mode
}

export default function TopicForm({ initialData, slug }: TopicFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({
    defaultValues: { name: initialData?.name || "" },
  });

  const isEdit = !!initialData && !!slug;

  const onSubmit = async (data: { name: string }) => {
    try {
      setLoading(true);
      
      if (isEdit && slug) {
        // Update existing topic
        const response = await topicApi.update(slug, { name: data.name });
        if (response.success) {
          toast.success("Cập nhật topic thành công");
          router.push("/topics");
        } else {
          toast.error("Không thể cập nhật topic");
        }
      } else {
        // Create new topic
        const response = await topicApi.create({ name: data.name });
        if (response.success) {
          toast.success("Tạo topic thành công");
          router.push("/topics");
        } else {
          toast.error("Không thể tạo topic");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      // Handle specific error messages from API
      if (error.message?.includes("already exists")) {
        toast.error("Topic với tên này đã tồn tại");
      } else if (error.message?.includes("required")) {
        toast.error("Tên topic không được để trống");
      } else {
        toast.error(isEdit ? "Lỗi khi cập nhật topic" : "Lỗi khi tạo topic");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Chỉnh sửa Topic" : "Tạo Topic mới"}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên topic *
          </label>
          <input
            {...register("name", { 
              required: "Bắt buộc nhập tên topic",
              minLength: {
                value: 2,
                message: "Tên topic phải có ít nhất 2 ký tự"
              },
              maxLength: {
                value: 100,
                message: "Tên topic không được quá 100 ký tự"
              }
            })}
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tên topic..."
            disabled={loading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? "Đang cập nhật..." : "Đang tạo..."}
              </div>
            ) : (
              isEdit ? "Cập nhật" : "Tạo mới"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}