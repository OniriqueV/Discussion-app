"use client"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function TopicForm({ initialData }: { initialData?: { name: string } }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({
    defaultValues: { name: initialData?.name || "" },
  });

  const isEdit = !!initialData;

  const onSubmit = async (data: { name: string }) => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success(isEdit ? "Cập nhật topic thành công" : "Tạo topic thành công");
    router.push("/topics");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm">Tên topic</label>
        <input
          {...register("name", { required: "Bắt buộc nhập tên topic" })}
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
