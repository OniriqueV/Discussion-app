"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null); // ✅ Trạng thái thông báo

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "1029936921176-sntj0im2gbjf4plljc3sb1d04sa9a4qm.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.prompt();

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin")!,
          { theme: "outline", size: "large", width: "100%" }
        );

        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  function handleCredentialResponse(response: any) {
    const idToken = response.credential;

    fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: idToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Unknown error");
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("cre", response.credential);

        setMessage("✅ Đăng nhập thành công! Đang chuyển hướng...");
        setTimeout(() => router.push("/dashboard"), 1000); // chuyển hướng sau 1s
      })
      .catch((err) => {
        setMessage("❌ Lỗi đăng nhập: " + err.message);
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 rounded-lg bg-white shadow w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-4">Đăng nhập hệ thống</h1>

        {/* Google Signin button */}
        <div id="google-signin" className="mb-4" />

        {/* Thông báo */}
        {message && (
          <div className="mb-4 text-sm text-center text-red-600">{message}</div>
        )}

        <div className="text-sm text-gray-400">Hoặc các hình thức khác</div>
        <button className="mt-2 w-full py-2 bg-gray-200 rounded">Facebook (demo)</button>
        <button className="mt-2 w-full py-2 bg-gray-200 rounded">Email (demo)</button>
      </div>
    </div>
  );
}
