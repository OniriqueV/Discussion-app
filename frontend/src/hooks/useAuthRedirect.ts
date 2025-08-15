"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

type Role = "admin" | "ca_user" | "member";

interface JwtPayload {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  exp: number;
  sub: string; // user id dưới dạng string trong JWT
  company_id?: number;
  avatar?: string;
  day_of_birth?: string;
}

// ✅ Import hoặc định nghĩa lại fixAvatarUrl function
const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:8080';

const fixAvatarUrl = (avatarUrl: string | null | undefined): string | undefined => {
  if (!avatarUrl) return undefined;
  
  // Nếu đã có protocol, trả về nguyên vẹn
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // Nếu bắt đầu bằng /uploads/, thêm UPLOADS_URL
  if (avatarUrl.startsWith('/uploads/')) {
    return `${UPLOADS_URL}${avatarUrl}`;
  }
  
  // Nếu bắt đầu bằng uploads/, thêm UPLOADS_URL và /
  if (avatarUrl.startsWith('uploads/')) {
    return `${UPLOADS_URL}/${avatarUrl}`;
  }
  
  return avatarUrl;
};

export function useAuthRedirect(...requiredRoles: Role[]) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const notifiedRef = useRef(false); // ✅ ngăn spam thông báo

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (!notifiedRef.current) {
        toast.error("Vui lòng đăng nhập");
        notifiedRef.current = true;
      }
      router.push("/login");
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        if (!notifiedRef.current) {
          toast.error("Phiên đăng nhập đã hết hạn");
          notifiedRef.current = true;
        }
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setUserRole(decoded.role);
      setIsAuthenticated(true);

      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        if (!notifiedRef.current) {
          // toast.error("Bạn không có quyền truy cập trang này");
          notifiedRef.current = true;
        }
        router.push("/dashboard");
        return;
      }
    } catch (err) {
      if (!notifiedRef.current) {
        toast.error("Token không hợp lệ");
        notifiedRef.current = true;
      }
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [requiredRoles, router]);

  return { isAuthenticated, userRole };
}

// ✅ FIX: Ensure user ID is always number for consistency + Fix avatar URL
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
          email: decoded.email,
          role: decoded.role,
          company_id: decoded.company_id,
          full_name: decoded.full_name,
          avatar: fixAvatarUrl(decoded.avatar), // ✅ FIX: Apply fixAvatarUrl here
          day_of_birth: decoded.day_of_birth,
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

  // ✅ Thêm method để update user avatar sau khi upload
  const updateUserAvatar = (newAvatarUrl: string) => {
    setUser(prevUser => 
      prevUser ? {
        ...prevUser,
        avatar: fixAvatarUrl(newAvatarUrl)
      } : null
    );
  };

  return { user, isLoading, updateUserAvatar };
}