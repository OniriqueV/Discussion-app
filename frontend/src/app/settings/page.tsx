"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import AvatarUploader from "@/components/AvatarUploader";
import Breadcrumb from "@/components/Breadcrumb";
import CustomDatePicker from "@/components/DatePicker";
import Header from "@/components/Header";
import { toast } from "react-toastify";
import { userService, UpdateUserDto } from "@/api/user";
import { useCurrentUser } from "@/hooks/useAuthRedirect";
import { formatISO, parseISO } from "date-fns";

type FormData = {
  fullName: string;
};

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();
  const { register, handleSubmit, setValue, formState } = useForm<FormData>();
  const [dob, setDob] = useState<Date | null>(null);
  const [dobError, setDobError] = useState<string>("");

  useEffect(() => {
    if (user) {
      setValue("fullName", user.full_name);
      if (user.day_of_birth) {
        setDob(parseISO(user.day_of_birth));
      }
    }
  }, [user, setValue]);

  const validateDateOfBirth = (date: Date | null): boolean => {
    if (!date) {
      setDobError("Vui lòng chọn ngày sinh");
      return false;
    }

    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const hundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

    if (date > today) {
      setDobError("Ngày sinh không thể lớn hơn ngày hiện tại");
      return false;
    }

    if (date > eighteenYearsAgo) {
      setDobError("Bạn phải từ 18 tuổi trở lên");
      return false;
    }

    if (date < hundredYearsAgo) {
      setDobError("Ngày sinh không hợp lệ");
      return false;
    }

    setDobError("");
    return true;
  };

  const handleDateChange = (date: Date | null) => {
    setDob(date);
    if (date) validateDateOfBirth(date);
    else setDobError("");
  };

  const onSubmit = async (data: FormData) => {
    if (!validateDateOfBirth(dob) || !user?.id) return;

    const payload: UpdateUserDto = {
      full_name: data.fullName,
      day_of_birth: dob ? formatISO(dob, { representation: "date" }) : undefined,
    };

    try {
      await userService.updateUser(user.id, payload);
      toast.success("Cập nhật thành công");
    } catch (e) {
      toast.error("Cập nhật thất bại");
    }
  };

  const onError = (errors: any) => {
    const messages = Object.values(errors).map((e: any) => e.message);
    toast.error(messages[0] || "Vui lòng kiểm tra các trường bắt buộc");
  };

  if (isLoading) return <div className="p-4 text-center">Đang tải...</div>;
  if (!user) return <div className="p-4 text-center">Không tìm thấy người dùng</div>;

  console.log("Avatar URL:", user?.avatar);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header showSettings={false} />
      <main className="flex-1 py-8">
        <div className="max-w-xl mx-auto p-6">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/dashboard" },
              { label: "Tài khoản", href: "/account" },
              { label: "Cài đặt", active: true },
            ]}
          />
          <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>


          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            
            <AvatarUploader avatarUrl={user.avatar} />


            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">Họ tên</label>
              <input
                type="text"
                {...register("fullName", {
                  required: "Họ tên là bắt buộc",
                  minLength: { value: 2, message: "Họ tên quá ngắn" },
                  pattern: {
                    value: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: "Họ tên chỉ được chứa chữ cái và khoảng trắng",
                  },
                })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                placeholder="Nhập họ tên của bạn"
              />
              {formState.errors.fullName && (
                <span className="text-red-500 text-sm">{formState.errors.fullName.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">Email không thể thay đổi</p>
            </div>

            <CustomDatePicker
              label="Ngày sinh"
              value={dob}
              onChange={handleDateChange}
              error={dobError}
              maxDate={new Date()}
            />

            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {formState.isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
