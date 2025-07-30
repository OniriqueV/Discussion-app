
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

class UserService {
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
    
    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  }

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

      return this.handleResponse<PaginatedResponse<User>>(response);
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

      return this.handleResponse<User>(response);
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
      return result;
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
      return result;
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