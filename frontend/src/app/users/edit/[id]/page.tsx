// src/app/users/edit/[id]/page.tsx
import Header from "@/components/Header";
import UserForm from "@/components/UserForm";
import { getUserById } from "@/mock/users";
import { use } from "react";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // unwrap params with use()
  const parsedId = parseInt(id, 10);
  
  // Fetch user data from mock
  const user = getUserById(parsedId);
  
  if (!user) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-red-500">Không tìm thấy người dùng</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <UserForm initialData={{ ...user, dateOfBirth: new Date(user.dateOfBirth) }} />
      </div>
    </>
  );
}