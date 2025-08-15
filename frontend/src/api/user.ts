import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:8080';

// Helper function to fix avatar URLs - giống như post images
const fixAvatarUrl = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null;
  
  // Nếu đã có protocol, trả về nguyên vẹn
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // Nếu bắt đầu bằng /uploads/, thêm UPLOADS_URL
  if (avatarUrl.startsWith('/uploads/')) {
    return `${UPLOADS_URL}${avatarUrl}`;
  }
  
  // Nếu bắt đầu bằng uploads/, thêm UPLOADS_URL và /
  if (avatarUrl.startsWith('uploads/')) {
    return `${UPLOADS_URL}/${avatarUrl}`;
  }
  
  return avatarUrl;
};

// Helper function to fix avatar URLs in user objects
const fixUserAvatarUrl = <T extends { avatar?: string | null }>(user: T): T => {
  if (user.avatar) {
    user.avatar = fixAvatarUrl(user.avatar);
  }
  return user;
};

// Types matching your backend DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'ca_user' | 'member';
  company_id?: number;
  status?: 'active' | 'inactive';
  day_of_birth?: string; // ISO string format
}

export interface UpdateUserDto {
  email?: string;
  full_name?: string;
  role?: 'admin' | 'ca_user' | 'member';
  company_id?: number;
  status?: 'active' | 'inactive';
  day_of_birth?: string;
  // Loại bỏ avatar từ UpdateUserDto vì sẽ upload riêng
}

export interface AssignCaUserDto {
  userIds: number[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'ca_user' | 'member';
  company_id?: number;
  status: 'active' | 'inactive';
  day_of_birth?: string;
  avatar?: string; // URL của avatar
  created_at?: string;
  updated_at?: string;
  company?: {
    id: number;
    name: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserRanking {
  user_id: number;
  full_name: string;
  email: string;
  company_name: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  yearly_points: number;
  rank: number;
  current_period_points: number;
}

export interface RankingResponse {
  data: UserRanking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  period: string;
}

// Response type cho upload avatar
export interface AvatarUploadResponse {
  avatar_url: string;
  message: string;
  user?: User;
}

class UserService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private getAuthHeadersForFile() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      // Không set Content-Type cho FormData, browser sẽ tự động set
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  }

  // Phương thức upload avatar riêng
  async uploadAvatar(userId: number, file: File): Promise<AvatarUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
        method: 'POST',
        headers: this.getAuthHeadersForFile(),
        body: formData,
      });

      const result = await this.handleResponse<AvatarUploadResponse>(response);
      
      // Fix avatar URLs trong response
      if (result.avatar_url) {
        result.avatar_url = fixAvatarUrl(result.avatar_url) || '';
      }
      if (result.user) {
        result.user = fixUserAvatarUrl(result.user);
      }
      
      toast.success('Upload avatar thành công');
      return result;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Không thể upload avatar');
      throw error;
    }
  }

  // Bỏ phương thức xóa avatar vì không cần thiết nữa

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    company_id?: number;
  }): Promise<PaginatedResponse<User>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.role) searchParams.append('role', params.role);
      if (params?.company_id) searchParams.append('company_id', params.company_id.toString());

      const url = `${API_BASE_URL}/users${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<PaginatedResponse<User>>(response);
      
      // Fix avatar URLs cho tất cả users
      if (result.data) {
        result.data = result.data.map(fixUserAvatarUrl);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<User>(response);
      return fixUserAvatarUrl(result);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Không thể tải thông tin người dùng');
      throw error;
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const result = await this.handleResponse<User>(response);
      toast.success('Tạo người dùng thành công');
      return fixUserAvatarUrl(result);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Không thể tạo người dùng');
      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const result = await this.handleResponse<User>(response);
      toast.success('Cập nhật người dùng thành công');
      return fixUserAvatarUrl(result);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Không thể cập nhật người dùng');
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      await this.handleResponse<void>(response);
      toast.success('Xóa người dùng thành công');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Không thể xóa người dùng');
      throw error;
    }
  }

  async assignCaUsers(userIds: number[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/assign-ca-users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userIds }),
      });

      await this.handleResponse<void>(response);
      toast.success('Gán quyền CA User thành công');
    } catch (error) {
      console.error('Error assigning CA users:', error);
      toast.error('Không thể gán quyền CA User');
      throw error;
    }
  }
}

export const userService = new UserService();