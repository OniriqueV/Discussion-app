// src/api/topic.ts - Updated API client
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
console.log("API ĐANG GỌI LÀ",process.env.NEXT_PUBLIC_API_URL)
export interface Topic {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  deleted_at?: string;
  posts?: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    views: number;
    is_pinned: boolean;
  }>;
  _count?: {
    posts: number;
  };
}

export interface CreateTopicDto {
  name: string;
}

export interface UpdateTopicDto {
  name: string;
}

export interface BulkDeleteDto {
  slugs: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class TopicApi {
  private adminBaseUrl = `${API_URL}/admin/topics`; // Admin routes
  private publicBaseUrl = `${API_URL}/topics`; // Public routes

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

  // Admin methods (require admin role)
  async create(data: CreateTopicDto): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(this.adminBaseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async findAllAdmin(): Promise<ApiResponse<Topic[]>> {
    return this.request<Topic[]>(this.adminBaseUrl);
  }

  async getStats(): Promise<ApiResponse<any>> {
    return this.request<any>(`${this.adminBaseUrl}/stats`);
  }

  async findBySlugAdmin(slug: string): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`${this.adminBaseUrl}/${encodeURIComponent(slug)}`);
  }

  async update(slug: string, data: UpdateTopicDto): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`${this.adminBaseUrl}/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(slug: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${this.adminBaseUrl}/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  }

  async bulkDelete(data: BulkDeleteDto): Promise<ApiResponse<any>> {
    return this.request<any>(this.adminBaseUrl, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  // Public methods (for authenticated users - ca_user, admin, etc.)
  async findAll(): Promise<ApiResponse<Topic[]>> {
    return this.request<Topic[]>(this.publicBaseUrl);
  }

  async findAllPublic(): Promise<ApiResponse<Topic[]>> {
    // This method now calls the public endpoint
    return this.findAll();
  }

  async findBySlug(slug: string): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`${this.publicBaseUrl}/${encodeURIComponent(slug)}`);
  }
}

export const topicApi = new TopicApi();