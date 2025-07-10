"use client";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { USER_ROLES, STATUS_OPTIONS, COMPANIES } from "@/config/constants";
import CustomDatePicker from "@/components/DatePicker";

type FormValues = {
  name: string;
  email: string;
  role: string;
  status: string;
  company: string;
  dateOfBirth: Date | null;
};

interface Props {
  initialData?: Partial<FormValues>;
}

export default function UserForm({ initialData }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      role: initialData?.role || "member",
      status: initialData?.status || "active",
      company: initialData?.company || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : null,
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
    <div className="relative max-w-xl mx-auto p-6">

      <div className="relative max-w-xl mx-auto p-6">
        {/* Nút nằm góc trên phải */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-6 right-6 text-sm text-blue-600 hover:underline"
        >
        Quay lại
        </button>

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
          {errors.name && (
        <p className="text-red-500 text-sm">Bắt buộc</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
        {...register("email", { required: true })}
        className="w-full border px-3 py-2 rounded"
        type="email"
        // disabled={isEdit}
          />
          {errors.email && (
        <p className="text-red-500 text-sm">Bắt buộc</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Công ty</label>
          <select
        {...register("company", { required: true })}
        className="w-full border px-3 py-2 rounded"
          >
        <option value="">Chọn công ty</option>
        {COMPANIES.map((company) => (
          <option key={company.value} value={company.value}>
            {company.label}
          </option>
        ))}
          </select>
          {errors.company && (
        <p className="text-red-500 text-sm">Bắt buộc</p>
          )}
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

        <div>
          <Controller
        name="dateOfBirth"
        control={control}
        rules={{ required: "Ngày sinh là bắt buộc" }}
        render={({ field: { onChange, value } }) => (
          <CustomDatePicker
            label="Ngày sinh"
            value={value}
            onChange={onChange}
            error={errors.dateOfBirth?.message}
            maxDate={new Date()}
            showYearDropdown={true}
            showMonthDropdown={true}
          />
        )}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </button>
      </form>

      </div>
    </div>
  );
}