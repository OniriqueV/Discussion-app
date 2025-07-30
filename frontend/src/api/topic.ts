// src/lib/api/topic.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";



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
  private baseUrl = `${API_URL}/topics`;

  // 👇 sửa lại để đồng bộ với useAuthRedirect
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
      } catch (e) {
        // Fallback
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async create(data: CreateTopicDto): Promise<ApiResponse<Topic>> {
    return this.request<Topic>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async findAll(): Promise<ApiResponse<Topic[]>> {
    return this.request<Topic[]>('');
  }

  async getStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/stats');
  }

  async findBySlug(slug: string): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`/${encodeURIComponent(slug)}`);
  }

  async update(slug: string, data: UpdateTopicDto): Promise<ApiResponse<Topic>> {
    return this.request<Topic>(`/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(slug: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  }

  async bulkDelete(data: BulkDeleteDto): Promise<ApiResponse<any>> {
    return this.request<any>('', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }
}

export const topicApi = new TopicApi();
