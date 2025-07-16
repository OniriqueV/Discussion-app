"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "react-toastify";
import { topicsMock } from "@/mock/topics";
import { tagsMock } from "@/mock/tags";
import { PostStatus } from "@/mock/posts";

interface FormValues {
  title: string;
  description: string;
  topicId: string;
  status: PostStatus;
  tagIds: string[];
}

interface PostFormProps {
  initialData?: FormValues;
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: initialData ?? {
      title: "",
      description: "",
      topicId: "",
      status: "not_resolved",
      tagIds: [],
    },
    mode: "onChange",
  });

  const watchedTagIds = watch("tagIds") || [];

  // Tiptap editor configuration
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.description || "",
    onUpdate({ editor }) {
      setValue("description", editor.getHTML(), { shouldValidate: true });
    },
  });

  // Handle tag selection
  const handleCheckboxChange = (tagId: string) => {
    const updatedTags = watchedTagIds.includes(tagId)
      ? watchedTagIds.filter((id) => id !== tagId)
      : [...watchedTagIds, tagId];
    setValue("tagIds", updatedTags, { shouldValidate: true });
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const message = initialData 
        ? "Cập nhật bài viết thành công!" 
        : "Tạo bài viết mới thành công!";
      
      toast.success(message);
      console.log("Saving post:", data);
      router.push("/posts");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {initialData ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <p className="mt-2 text-gray-600">
            {initialData 
              ? "Cập nhật thông tin bài viết của bạn" 
              : "Điền thông tin để tạo bài viết mới"}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", { 
                  required: "Tiêu đề là bắt buộc",
                  minLength: { value: 5, message: "Tiêu đề phải có ít nhất 5 ký tự" }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tiêu đề bài viết..."
              />
              {errors.title && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <EditorContent 
                  editor={editor} 
                  className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Topic and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topic Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Chủ đề <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register("topicId", { required: "Vui lòng chọn chủ đề" })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.topicId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topicsMock.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {errors.topicId && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.topicId.message}
                  </p>
                )}
              </div>

              {/* Status Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register("status", { required: "Vui lòng chọn trạng thái" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="not_resolved">Chưa giải quyết</option>
                  <option value="resolved">Đã giải quyết</option>
                  <option value="deleted_by_admin">Xóa bởi Admin</option>
                  <option value="deleted_by_company">Xóa bởi Công ty</option>
                </select>
              </div>
            </div>

            {/* Tags Field */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Tags
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {tagsMock.map((tag) => (
                  <label 
                    key={tag.id} 
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={watchedTagIds.includes(tag.id)}
                      onChange={() => handleCheckboxChange(tag.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {tag.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  initialData ? "Cập nhật bài viết" : "Lưu bài viết"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}