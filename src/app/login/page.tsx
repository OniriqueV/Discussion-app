"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra SDK đã load chưa
    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        // 1. Khởi tạo Google One Tap
        window.google.accounts.id.initialize({
          client_id: "1029936921176-sntj0im2gbjf4plljc3sb1d04sa9a4qm.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false, // bạn có thể đặt true nếu muốn tự động login
          cancel_on_tap_outside: false,
        });

        // 2. Gọi One Tap
        window.google.accounts.id.prompt();

        // 3. Render nút đăng nhập Google (fallback)
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin")!,
          { theme: "outline", size: "large", width: "100%" }
        );

        clearInterval(interval); // Ngừng kiểm tra
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  function handleCredentialResponse(response: any) {
    // ✅ Giả lập xử lý login
    localStorage.setItem("user", JSON.stringify(response));
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 rounded-lg bg-white shadow w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-4">Đăng nhập hệ thống</h1>

        {/* Nút Google sẽ được render ở đây */}
        <div id="google-signin" className="mb-4" />

        <div className="text-sm text-gray-400">Hoặc các hình thức khác</div>
        <button className="mt-2 w-full py-2 bg-gray-200 rounded">Facebook (demo)</button>
        <button className="mt-2 w-full py-2 bg-gray-200 rounded">Email (demo)</button>
      </div>
    </div>
  );
}
