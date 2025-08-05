// hooks/useAuthRedirect.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type Role = "admin" | "ca_user" | "member";

interface JwtPayload {
  id: number; // thêm để có thể dùng user.id
  full_name: string; // thêm để hiện tên người dùng
  email: string;
  role: Role;
  exp: number;
  sub: string; // user id dưới dạng string
  company_id?: number;
  avatar?: string;
}

export function useAuthRedirect(...requiredRoles: Role[]) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);

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
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setUserRole(decoded.role);
      setIsAuthenticated(true);

      // Check role-based access
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        alert("Bạn không có quyền truy cập trang này");
        router.push("/dashboard");
        return;
      }

    } catch (err) {
      alert("Token không hợp lệ");
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [requiredRoles, router]);

  return { isAuthenticated, userRole };
}

// Hook to get current user info from token
export function useCurrentUser() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    role: Role;
    company_id?: number;
    full_name: string;
    day_of_birth?: string;
    avatar?: string; 
    
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp >= now) {
        setUser({
          id: parseInt(decoded.sub),
          // sub: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          company_id: decoded.company_id,
          full_name: decoded.full_name,
          avatar: decoded.avatar,
        });

      } else {
        localStorage.removeItem("token");
        console.warn("Token expired");
      }
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading };
}


