// src/services/rankingService.ts
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface GetRankingDto {
  period?: 'total' | 'weekly' | 'monthly' | 'yearly';
  limit?: number;
  page?: number;
  company_id?: number;
}

export interface UserRanking {
  user_id: number;
  full_name: string;
  email: string;
  company_name: string;
  points: number;
  rank: number;
}

export interface UserRank {
  user_id: number;
  full_name: string;
  email: string;
  company_name: string | null;
  points: number;
  rank: number | null;
  period: string;
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
  company_id: number | null;
}

class RankingService {
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

  async getRanking(params?: GetRankingDto): Promise<RankingResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.period) {
      searchParams.append('period', params.period);
    }
    
    if (params?.limit && Number.isInteger(params.limit) && params.limit > 0) {
      searchParams.append('limit', String(params.limit)); // Explicitly convert to string
    }
    
    if (params?.page && Number.isInteger(params.page) && params.page > 0) {
      searchParams.append('page', String(params.page)); // Explicitly convert to string
    }
    
    const rawCompanyId = params?.company_id;
const companyId = Number(rawCompanyId);

if (Number.isInteger(companyId) && companyId > 0) {
  searchParams.append('company_id', String(companyId));
}



    const url = `${API_BASE_URL}/users/ranking${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    console.log('Fetching ranking with URL:', url, 'Params:', params); // Debug log
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<RankingResponse>(response);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    toast.error('Không thể tải bảng xếp hạng');
    throw error;
  }
}

  async getUserRank(userId: number, period: 'total' | 'weekly' | 'monthly' | 'yearly' = 'total'): Promise<UserRank> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'number' || userId <= 0) {
        throw new Error('Invalid user ID');
      }

      const searchParams = new URLSearchParams();
      if (period) {
        searchParams.append('period', period);
      }

      const url = `${API_BASE_URL}/users/ranking/${userId}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      console.log('Fetching user rank with URL:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserRank>(response);
    } catch (error) {
      console.error('Error fetching user rank:', error);
      toast.error('Không thể tải thứ hạng người dùng');
      throw error;
    }
  }

  async getMyRank(period: 'total' | 'weekly' | 'monthly' | 'yearly' = 'total'): Promise<UserRank> {
    try {
      const searchParams = new URLSearchParams();
      if (period) {
        searchParams.append('period', period);
      }

      const url = `${API_BASE_URL}/users/my-rank${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      console.log('Fetching my rank with URL:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserRank>(response);
    } catch (error) {
      console.error('Error fetching my rank:', error);
      toast.error('Không thể tải thứ hạng của bạn');
      throw error;
    }
  }
}

export const rankingService = new RankingService();