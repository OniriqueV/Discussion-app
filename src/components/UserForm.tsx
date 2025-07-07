"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { USER_ROLES, STATUS_OPTIONS } from "@/config/constants";

type FormValues = {
  name: string;
  email: string;
  role: string;
  status: string;
};

interface Props {
  initialData?: Partial<FormValues>;
}

export default function UserForm({ initialData }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      role: initialData?.role || "member",
      status: initialData?.status || "active",
    },
  });

  const isEdit = Boolean(initialData?.email);

  const onSubmit = async (data: FormValues) => {
    try {
      // Gọi API hoặc lưu tạm
      await new Promise((res) => setTimeout(res, 500));
      toast.success(isEdit ? "Cập nhật thành công" : "Thêm mới thành công");
      router.push("/users");
    } catch (e) {
      toast.error("Đã xảy ra lỗi khi lưu");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Họ tên</label>
          <input
            {...register("name", { required: true })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">Bắt buộc</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            {...register("email", { required: true })}
            className="w-full border px-3 py-2 rounded"
            // disabled={isEdit}
          />
          {errors.email && <p className="text-red-500 text-sm">Bắt buộc</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Vai trò</label>
          <select
            {...register("role")}
            className="w-full border px-3 py-2 rounded"
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Trạng thái</label>
          <select
            {...register("status")}
            className="w-full border px-3 py-2 rounded"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </button>
      </form>
    </div>
  );
}
