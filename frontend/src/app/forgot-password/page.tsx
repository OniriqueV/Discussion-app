"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("http://localhost:3001/auth/password/reset-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Có lỗi xảy ra");
      }

      setIsEmailSent(true);
      toast.success("Đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn");
      
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 rounded-lg bg-white shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu?</h1>
        
        {!isEmailSent ? (
          <>
            <p className="text-gray-600 mb-6 text-sm text-center">
              Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ"
                    }
                  })}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email của bạn"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi hướng dẫn'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Email đã được gửi!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. 
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau 1 phút.
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => router.push("/login")}
            className="text-blue-500 hover:underline text-sm"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}