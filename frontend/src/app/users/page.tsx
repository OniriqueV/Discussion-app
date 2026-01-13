"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserTable from "@/components/UserTable";
import Header from "@/components/Header";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function UsersPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Redirect if not authenticated or not authorized
  useAuthRedirect("admin", "ca_user"); // This will check if user is logged in and redirect to login if not

  const handleEdit = (id: number) => router.push(`/users/edit/${id}`);
  const handleAddUser = () => router.push("/users/add");
  
  // Function to trigger refresh of UserTable
  const refreshTable = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Header showUsers={false} />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            + Thêm người dùng
          </button>
        </div>
        <UserTable
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </>
  );
}