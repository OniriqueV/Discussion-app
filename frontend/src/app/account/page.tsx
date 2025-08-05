"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { toast } from "react-toastify";
import { userService, User } from "@/api/user";

// Auth service for current user info and password change
class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }
    
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      await this.handleResponse<void>(response);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  getUserAuthType(): 'normal' | 'google' | null {
    return localStorage.getItem('authType') as 'normal' | 'google' | null;
  }
}

const authService = new AuthService();

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const router = useRouter();

  const authType = authService.getUserAuthType();
  const isGoogleAuth = authType === 'google';

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Không thể tải thông tin tài khoản');
      // Redirect to login if unauthorized
      if (error instanceof Error && error.message.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword(oldPassword, newPassword);
      toast.success("Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : "Không thể đổi mật khẩu");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleName = (role: string) => {
    const roleNames = {
      admin: 'Quản trị viên',
      ca_user: 'Quản lý công ty',
      member: 'Thành viên',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  // Only allow members to access this page
  if (!loading && user && user.role !== 'member') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header showAccount={false} />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Truy cập bị từ chối</h2>
            <p className="text-gray-600">Trang này chỉ dành cho thành viên (member).</p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header showAccount={false} />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin tài khoản...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header showAccount={false} />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Lỗi</h2>
            <p className="text-gray-600">Không thể tải thông tin tài khoản.</p>
            <button
              onClick={loadUserData}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header showAccount={false} />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Thông tin tài khoản</h2>
          
          <div className="flex items-center space-x-6 mb-6">
            <img
              src={ "/avatar-default.jpg"} //user.avatar ||
              alt="Avatar"
              className="w-20 h-20 rounded-full border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avatar-default.jpg";
              }}
            />
            <div>
              <h3 className="text-xl font-bold">{user.full_name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Vai trò: {getRoleName(user.role)}</p>
              {user.company && (
                <p className="text-sm text-gray-500">Công ty: {user.company.name}</p>
              )}
              <p className="text-sm text-gray-500">Ngày tạo: {formatDate(user.created_at)}</p>
              {user.day_of_birth && (
                <p className="text-sm text-gray-500">Ngày sinh: {formatDate(user.day_of_birth)}</p>
              )}
              <p className="text-sm text-gray-500">
                Trạng thái: 
                <span className={`ml-1 ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </p>
              {isGoogleAuth && (
                <p className="text-sm text-blue-600 font-medium">Tài khoản Google</p>
              )}
            </div>
          </div>

          {/* Only show password change for normal auth users */}
          {!isGoogleAuth && (
            <>
              <hr className="my-6" />
              <h3 className="text-xl font-semibold mb-4">Đổi mật khẩu</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isChangingPassword}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                    disabled={isChangingPassword}
                  />
                  <p className="text-sm text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isChangingPassword}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isChangingPassword && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </form>
            </>
          )}

          {isGoogleAuth && (
            <>
              <hr className="my-6" />
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Tài khoản Google
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Bạn đã đăng nhập bằng tài khoản Google. Để thay đổi mật khẩu, 
                        vui lòng truy cập cài đặt tài khoản Google của bạn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}