"use client";
import Header from "@/components/Header";
import UserForm from "@/components/UserForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function AddUserPage() {
  // Redirect if not authenticated or not authorized
  useAuthRedirect("admin", "ca_user");

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <UserForm />
      </div>
    </>
  );
}