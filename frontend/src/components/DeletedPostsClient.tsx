"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useAuthRedirect";
import PostTable from "./PostTable";
import { ArrowLeft } from "lucide-react";

export default function DeletedPostsClient() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role === "ca_user" && !user.company_id)) {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  if (!user) return null;

  return (
    <div className="p-4">
      {/* Nút quay lại */}
      <div className="mb-4">
        <button
          onClick={() => router.push("/posts")}
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách bài viết
        </button>
      </div>

      <h1 className="text-xl font-semibold mb-4">Danh sách bài viết đã xoá</h1>

      <PostTable 
        showDeletedOnly 
        readOnly 
        companyId={user?.role === "ca_user" ? user.company_id : undefined}
      />
    </div>
  );
}
