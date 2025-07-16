// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
  const timer = setTimeout(() => {
    router.push("/login");
  }, 100); // Thêm chút delay nhỏ để layout/SDK kịp load

    return () => clearTimeout(timer);
  }, []);


  return null;
}
