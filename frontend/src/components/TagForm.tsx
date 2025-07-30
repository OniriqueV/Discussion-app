"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { tagApi } from "@/api/tag";

export default function TagForm({ initialData, slug }: { initialData?: { name: string }, slug?: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string }>({
    defaultValues: { name: initialData?.name || "" },
  });

  const isEdit = !!slug;

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: { name: string }) => {
    try {
      if (isEdit && slug) {
        await tagApi.update(slug, data);
        toast.success("Cập nhật tag thành công");
      } else {
        await tagApi.create(data);
        toast.success("Tạo tag thành công");
      }
      router.push("/tags");
    } catch (error: any) {
      toast.error("Lỗi: " + (error.message || "Không thể gửi form"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm">Tên tag</label>
        <input
          {...register("name", { required: "Bắt buộc nhập tên tag" })}
          className="w-full border px-3 py-2 rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Quay lại
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
