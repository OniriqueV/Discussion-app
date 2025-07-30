"use client";
import Header from "@/components/Header";
import UserForm from "@/components/UserForm";
import { use } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const parsedId = parseInt(id, 10);
  
  // Redirect if not authenticated or not authorized
  useAuthRedirect("admin", "ca_user");

  // Validate ID
  if (isNaN(parsedId)) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-red-500">ID người dùng không hợp lệ</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <UserForm userId={parsedId} />
      </div>
    </>
  );
}