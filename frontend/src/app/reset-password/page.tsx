"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');

  const password = watch('newPassword');

  useEffect(() => {
    if (!token) {
      toast.error("Token không hợp lệ");
      router.push("/forgot-password");
      return;
    }

    verifyToken(token);
  }, [token, router]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/auth/password/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsValidToken(true);
        setEmail(result.email);
      } else {
        throw new Error(result.message || "Token không hợp lệ");
      }
    } catch (error: any) {
      toast.error(error.message || "Token không hợp lệ hoặc đã hết hạn");
      router.push("/forgot-password");
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3001/auth/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Có lỗi xảy ra");
      }

      toast.success("Mật khẩu đã được đặt lại thành công!");
      router.push("/login");
      
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="p-6 rounded-lg bg-white shadow w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 rounded-lg bg-white shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Đặt lại mật khẩu</h1>
        
        <p className="text-gray-600 mb-6 text-sm text-center">
          Tạo mật khẩu mới cho tài khoản: <strong>{email}</strong>
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
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
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu mới"
            />
            {errors.newPassword && (
              <span className="text-red-500 text-sm">{errors.newPassword.message}</span>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Xác nhận mật khẩu là bắt buộc",
                validate: value => value === password || "Mật khẩu xác nhận không khớp"
              })}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lại mật khẩu mới"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
            )}
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Yêu cầu mật khẩu:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Ít nhất 6 ký tự</li>
              <li>Ít nhất 1 chữ hoa (A-Z)</li>
              <li>Ít nhất 1 chữ thường (a-z)</li>
              <li>Ít nhất 1 số (0-9)</li>
            </ul>
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            {isSubmitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
        
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}