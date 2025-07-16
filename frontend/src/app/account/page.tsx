"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { toast } from "react-toastify";

export default function AccountPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Mock user
  const user = {
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "member",
    createdAt: "2024-01-01",
    point: 12,
    avatar: "/avatar-default.jpg",
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    // TODO: Gọi API đổi mật khẩu
    toast.success("Đổi mật khẩu thành công");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header showAccount={false} />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Thông tin tài khoản</h2>

          <div className="flex items-center space-x-6 mb-6">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full border"
            />
            <div>
              <h3 className="text-xl font-bold">{user.fullName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Vai trò: {user.role}</p>
              <p className="text-sm text-gray-500">Ngày tạo: {user.createdAt}</p>
              <p className="text-sm text-gray-500">Điểm: {user.point}</p>
            </div>
          </div>

          <hr className="my-6" />

          <h3 className="text-xl font-semibold mb-4">Đổi mật khẩu</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
