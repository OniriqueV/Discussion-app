// app/settings/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import AvatarUploader from "@/components/AvatarUploader";
import Breadcrumb from "@/components/Breadcrumb";
import CustomDatePicker from "@/components/DatePicker";
import Header from "@/components/Header";
import { toast } from "react-toastify";

type FormData = {
  fullName: string;
  email: string;
};

export default function SettingsPage() {
  const { register, handleSubmit, formState } = useForm<FormData>();
  const [dob, setDob] = useState<Date | null>(null);
  const [dobError, setDobError] = useState<string>("");

  // Validation cho ngày sinh
  const validateDateOfBirth = (date: Date | null): boolean => {
    if (!date) {
      setDobError("Vui lòng chọn ngày sinh");
      return false;
    }

    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
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
    if (date) {
      validateDateOfBirth(date);
    } else {
      setDobError("");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!validateDateOfBirth(dob)) {
      return;
    }

    try {
      // Gọi API hoặc giả lập
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Cập nhật thành công");
    } catch (e) {
      toast.error("Cập nhật thất bại");
    }
  };

  const onError = (errors: any) => {
    const messages = Object.values(errors).map((e: any) => e.message);
    toast.error(messages[0] || "Vui lòng kiểm tra các trường bắt buộc");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header showSettings={false} />
      
      {/* Main Content */}
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
            <AvatarUploader />
            
            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">
                Họ tên
              </label>
              <input
                type="text"
                {...register("fullName", {
                  required: "Họ tên là bắt buộc",
                  minLength: {
                    value: 2,
                    message: "Họ tên quá ngắn",
                  },
                  pattern: {
                    value: /^[a-zA-ZÀ-ỹ\s]+$/,
                    message: "Họ tên chỉ được chứa chữ cái và khoảng trắng"
                  }
                })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Nhập họ tên của bạn"
              />
              {formState.errors.fullName && (
                <span className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formState.errors.fullName.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value="vietanh@example.com"
                disabled
                className="w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email không thể thay đổi
              </p>
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
              {formState.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Đang cập nhật...
                </span>
              ) : (
                "Cập nhật"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}