// src/api/tag.ts - Fixed API client
import { ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  deleted_at?: string;
  _count?: {
    post_tags: number;
  };
  // Computed property for post count
  postCount: number;
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
  private adminBaseUrl = `${API_URL}/admin/tags`; // Admin routes
  private publicBaseUrl = `${API_URL}/tags`; // Public routes

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    try {
      const response = await fetch(url, {
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
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Transform backend response to include postCount
  private transformTag(tag: any): Tag {
    return {
      ...tag,
      postCount: tag._count?.post_tags || 0
    };
  }

  private transformTags(tags: any[]): Tag[] {
    return tags.map(tag => this.transformTag(tag));
  }

  // Admin methods (require admin role)
  async create(data: CreateTagDto): Promise<ApiResponse<Tag>> {
    const response = await this.request<any>(this.adminBaseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return {
      ...response,
      data: this.transformTag(response.data)
    };
  }

  async findAllAdmin(query: SearchTagDto = {}): Promise<ApiResponse<Tag[]>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const response = await this.request<any[]>(`${this.adminBaseUrl}${queryString ? `?${queryString}` : ''}`);
    
    return {
      ...response,
      data: this.transformTags(response.data)
    };
  }

  async getStats(): Promise<ApiResponse<any>> {
    return this.request<any>(`${this.adminBaseUrl}/stats`);
  }

  async getPopularAdmin(limit = 10): Promise<ApiResponse<Tag[]>> {
    const response = await this.request<any[]>(`${this.adminBaseUrl}/popular?limit=${limit}`);
    
    return {
      ...response,
      data: this.transformTags(response.data)
    };
  }

  async findBySlugAdmin(slug: string): Promise<ApiResponse<Tag>> {
    const response = await this.request<any>(`${this.adminBaseUrl}/${encodeURIComponent(slug)}`);
    
    return {
      ...response,
      data: this.transformTag(response.data)
    };
  }

  async update(slug: string, data: UpdateTagDto): Promise<ApiResponse<Tag>> {
    const response = await this.request<any>(`${this.adminBaseUrl}/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    return {
      ...response,
      data: this.transformTag(response.data)
    };
  }

  async delete(slug: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${this.adminBaseUrl}/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  }

  async bulkDelete(data: BulkDeleteTagDto): Promise<ApiResponse<any>> {
    return this.request<any>(this.adminBaseUrl, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  // Public methods (for authenticated users - ca_user, admin, etc.)
  async findAll(query: SearchTagDto = {}): Promise<ApiResponse<Tag[]>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const response = await this.request<any[]>(`${this.publicBaseUrl}${queryString ? `?${queryString}` : ''}`);
    
    return {
      ...response,
      data: this.transformTags(response.data)
    };
  }

  async findAllPublic(query: SearchTagDto = {}): Promise<ApiResponse<Tag[]>> {
    // This method now calls the public endpoint
    return this.findAll(query);
  }

  async getPopular(limit = 10): Promise<ApiResponse<Tag[]>> {
    const response = await this.request<any[]>(`${this.publicBaseUrl}/popular?limit=${limit}`);
    
    return {
      ...response,
      data: this.transformTags(response.data)
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<Tag>> {
    const response = await this.request<any>(`${this.publicBaseUrl}/${encodeURIComponent(slug)}`);
    
    return {
      ...response,
      data: this.transformTag(response.data)
    };
  }
}

export const tagApi = new TagApi();