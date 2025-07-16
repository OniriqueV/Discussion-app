// hooks/useAuthRedirect.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode}from "jwt-decode";

type Role = "admin" | "ca_user" | "member";

interface JwtPayload {
  role: Role;
  exp: number;
}

export function useAuthRedirect(requiredRole?: Role) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Vui lòng đăng nhập");
      router.push("/login");
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        alert("Phiên đăng nhập đã hết hạn");
        router.push("/login");
        return;
      }

      if (requiredRole && decoded.role !== requiredRole) {
        alert("Bạn không có quyền truy cập trang này");
        router.push("/dashboard");
        return;
      }
    } catch (err) {
      alert("Token không hợp lệ");
      router.push("/login");
    }
  }, [requiredRole]);
}
