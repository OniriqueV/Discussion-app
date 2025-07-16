"use client";

import UserForm from "@/components/UserForm";
import Header from "@/components/Header";

export default function AddUserPage() {
  try {
  return (
    <>
      <Header />
      <UserForm />
    </>
  );
} catch (err) {
  console.error("Lỗi trong AddUserPage:", err);
  return <div>Không thể hiển thị trang thêm người dùng</div>;
}

}
