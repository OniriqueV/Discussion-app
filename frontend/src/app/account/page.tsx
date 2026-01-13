"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Header from "@/components/Header";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        router.push("/login");
        return;
      }

      console.log('🔄 Sending change password request...', {
        currentPassword: '***',
        newPassword: '***',
        confirmPassword: '***'
      });

      const response = await fetch("http://localhost:3001/auth/password/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status);

      // Đọc response body trước khi kiểm tra
      const result = await response.json();
      console.log('📋 Response data:', result);

      if (!response.ok) {
        // Xử lý các lỗi cụ thể
        if (response.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn");
          localStorage.removeItem('token'); // Clear invalid token
          router.push("/login");
          return;
        }
        
        if (response.status === 400) {
          // Backend trả về lỗi validation
          const errorMessage = result.message || "Có lỗi xảy ra";
          toast.error(errorMessage);
          return;
        }

        if (response.status === 404) {
          toast.error("Người dùng không tồn tại");
          return;
        }

        // Lỗi khác
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Thành công
      toast.success(result.message || "Mật khẩu đã được thay đổi thành công!");
      
      // Có thể clear form
      // reset();
      
      // Chuyển hướng sau một chút để user thấy thông báo success
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Change password error:', error);
      
      // Xử lý network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <>
    <Header />
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100">
    <div className="p-6 rounded-lg bg-white shadow w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                {...register("currentPassword", {
                  required: "Mật khẩu hiện tại là bắt buộc"
                })}
                className="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="text-red-500 text-sm">{errors.currentPassword.message}</span>
            )}
          </div>
          
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                {...register("newPassword", {
                  required: "Mật khẩu mới là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự"
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
                    message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
                  }
                })}
                className="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <span className="text-red-500 text-sm">{errors.newPassword.message}</span>
            )}
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Xác nhận mật khẩu là bắt buộc",
                  validate: value => value === newPassword || "Mật khẩu xác nhận không khớp"
                })}
                className="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
            )}
          </div>
          
          {/* Password Requirements */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Yêu cầu mật khẩu mới:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Ít nhất 6 ký tự</li>
              <li>Ít nhất 1 chữ hoa (A-Z)</li>
              <li>Ít nhất 1 chữ thường (a-z)</li>
              <li>Ít nhất 1 số (0-9)</li>
              <li>Phải khác mật khẩu hiện tại</li>
            </ul>
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            {isSubmitting ? 'Đang thay đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => router.back()}
            className="text-blue-500 hover:underline text-sm"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
    </>
  );
}