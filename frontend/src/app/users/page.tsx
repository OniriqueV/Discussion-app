"use client";

import { useRouter } from "next/navigation";
import UserTable from "@/components/UserTable";
import { usersMock } from "@/mock/users";
import Header from "@/components/Header";

export default function UsersPage() {
  const router = useRouter();

  const handleEdit = (id: number) => router.push(`/users/edit/${id}`);
  const handleDelete = (id: number) => console.log(`Deleted user with ID: ${id}`);
  const handleBulkDelete = (ids: number[]) => console.log(`Bulk deleted: ${ids.join(", ")}`);
  const handleAddUser = () => router.push("/users/add");

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
          users={usersMock}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
        />
      </div>
    </>
  );
}
