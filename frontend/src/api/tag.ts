import { ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Tag {
  postCount: ReactNode;
  id: string;
  name: string;
  slug: string;
  created_at: string;
  deleted_at?: string;
  _count?: {
    post_tags: number;
  };
  post_tags?: Array<{
    post: {
      id: string;
      title: string;
      status: string;
      created_at: string;
      views: number;
      is_pinned: boolean;
      user?: {
        id: string;
        full_name: string;
        avatar: string;
      };
    };
  }>;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name: string;
}

export interface BulkDeleteTagDto {
  slugs: string[];
}

export interface SearchTagDto {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: any;
}

class TagApi {
  private baseUrl = `${API_URL}/tags`;

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token'); // match useAuthRedirect
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async create(data: CreateTagDto): Promise<ApiResponse<Tag>> {
    return this.request<Tag>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async findAll(query: SearchTagDto = {}): Promise<ApiResponse<Tag[]>> {
    const params = new URLSearchParams(query as any).toString();
    return this.request<Tag[]>(`?${params}`);
  }

  async getStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/stats');
  }

  async getPopular(limit = 10): Promise<ApiResponse<Tag[]>> {
    return this.request<Tag[]>(`/popular?limit=${limit}`);
  }

  async findBySlug(slug: string): Promise<ApiResponse<Tag>> {
    return this.request<Tag>(`/${encodeURIComponent(slug)}`);
  }

  async update(slug: string, data: UpdateTagDto): Promise<ApiResponse<Tag>> {
    return this.request<Tag>(`/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(slug: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  }

  async bulkDelete(data: BulkDeleteTagDto): Promise<ApiResponse<any>> {
    return this.request<any>('', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }
}

export const tagApi = new TagApi();
