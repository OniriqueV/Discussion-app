"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import WYSIWYGEditor from "./WYSIWYGEditor";
import { createPost, updatePost, uploadPostImages, uploadTempImages, getPost, Post } from "@/api/postApi";
import {Tag, tagApi} from "@/api/tag";
import { Topic, topicApi } from "@/api/topic";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

interface FormValues {
  title: string;
  description: string;
  topic_id: string;
  tag_ids: string[];
}

interface PostFormProps {
  postId?: number;
}

export default function PostForm({ postId }: PostFormProps) {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [initialPost, setInitialPost] = useState<Post | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      topic_id: "",
      tag_ids: [],
    },
    mode: "onChange",
  });

  const watchedTagIds = watch("tag_ids") || [];
  type PostWithTags = Post & {
  tags: { id: number }[];
};
  // Load tags for the form
  useEffect(() => {
  const fetchTags = async () => {
    try {
      const res = await tagApi.findAllPublic();
      setTags(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tag:", error);
      toast.error("Không thể tải danh sách tag");
    }
  };

  fetchTags();
}, []);
  // Load topics for the form
    useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await topicApi.findAllPublic();
        setTopics(res.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách topic:", error);
        toast.error("Không thể tải danh sách topic");
      }
    };

    fetchTopics();
  }, []);
  // Check authentication
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Vui lòng đăng nhập để tạo bài viết");
      router.push("/login");
      return;
    }
  }, [currentUser, userLoading, router]);

  // Load existing post data for editing
  useEffect(() => {
    const loadPost = async () => {
      if (postId) {
        try {
          setLoading(true);
          const post = await getPost(postId) as PostWithTags;
          setInitialPost(post);
          
          // Check if user can edit this post
          if (post.user_id !== currentUser?.id && currentUser?.role !== 'admin' && currentUser?.role !== 'ca_user') {
            toast.error("Bạn không có quyền chỉnh sửa bài viết này");
            router.push("/posts");
            return;
          }
          
          // Populate form with existing data
          reset({
            title: post.title,
            description: post.description,
            topic_id: post.topic_id?.toString() || "",
            tag_ids: post.tags?.map(tag => tag.id.toString()) || [],
          });
        } catch (error) {
          console.error("Error loading post:", error);
          toast.error("Lỗi khi tải thông tin bài viết");
          router.push("/posts");
        } finally {
          setLoading(false);
        }
      }
    };

    if (currentUser && postId) {
      loadPost();
    }
  }, [postId, reset, router, currentUser]);

  // Handle description change from WYSIWYG editor
  const handleDescriptionChange = (content: string) => {
    setValue("description", content, { shouldValidate: true });
  };

  // Handle tag selection
  const handleCheckboxChange = (tagId: string) => {
    const updatedTags = watchedTagIds.includes(tagId)
      ? watchedTagIds.filter((id) => id !== tagId)
      : [...watchedTagIds, tagId];
    setValue("tag_ids", updatedTags, { shouldValidate: true });
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // If we're editing a post, upload to that post
      if (postId) {
        const result = await uploadPostImages(postId, [file]);
        // Return the URL of the uploaded image
        return result.images[result.images.length - 1];
      } else {
        // For new posts, upload to Next.js API route
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/uploads/temp', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.url;
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      
      // Fallback to blob URL if upload fails
      console.warn("Upload failed, using blob URL as fallback");
      return URL.createObjectURL(file);
    }
  };


  // Function to fix image URLs in content
  const fixImageUrls = (content: string): string => {
    // Replace relative paths with absolute paths
    return content.replace(/src="\.\.\/uploads\/temp\//g, 'src="/uploads/temp/');
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      // Check authentication
      if (!currentUser) {
        toast.error("Vui lòng đăng nhập để tạo bài viết");
        router.push("/login");
        return;
      }

      // Fix image URLs in description
      const fixedDescription = fixImageUrls(data.description);
      
      const postData = {
        title: data.title,
        description: fixedDescription,
        topic_id: data.topic_id ? parseInt(data.topic_id) : undefined,
        tag_ids: data.tag_ids.map(id => parseInt(id)),
      };

      if (postId) {
        // Check if user can edit this post
        if (initialPost && initialPost.user_id !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'ca_user') {
          toast.error("Bạn không có quyền chỉnh sửa bài viết này");
          return;
        }
        
        // Update existing post
        await updatePost(postId, postData);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        // Create new post
        const newPost = await createPost(postData);
        toast.success("Tạo bài viết mới thành công!");
        
        // Redirect to the new post detail page
        router.push(`/posts/detail/${newPost.id}`);
        return;
      }
      
      router.push("/posts");
    } catch (error: any) {
      console.error("Error saving post:", error);
      
      // Handle specific error messages from the API
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    }
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Đang kiểm tra quyền truy cập...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Vui lòng đăng nhập để tạo bài viết</p>
              <button
                onClick={() => router.push("/login")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {postId ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </h1>
              <p className="mt-2 text-gray-600">
                {postId 
                  ? "Cập nhật thông tin bài viết của bạn" 
                  : "Điền thông tin để tạo bài viết mới"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tác giả:</p>
              <p className="font-medium text-gray-900">{currentUser.full_name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
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
                  minLength: { value: 5, message: "Tiêu đề phải có ít nhất 5 ký tự" },
                  maxLength: { value: 255, message: "Tiêu đề không được quá 255 ký tự" }
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
              <WYSIWYGEditor
                value={watch("description") || ""}
                onChange={handleDescriptionChange}
                placeholder="Nhập mô tả bài viết..."
                height={300}
                onImageUpload={handleImageUpload}
              />
              {errors.description && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Topic Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Chủ đề
              </label>
              <select 
                {...register("topic_id")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">-- Chọn chủ đề (tùy chọn) --</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Field */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Tags
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {tags.map((tag) => (
                  <label 
                    key={tag.id} 
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={watchedTagIds.includes(tag.id.toString())}
                      onChange={() => handleCheckboxChange(tag.id.toString())}

                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {tag.name}
                    </span>
                  </label>
                ))}

              </div>
            </div>

            {/* Show current images if editing */}
            {initialPost?.images && initialPost.images.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Hình ảnh hiện tại
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {initialPost.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  postId ? "Cập nhật bài viết" : "Lưu bài viết"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}