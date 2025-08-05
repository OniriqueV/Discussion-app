import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// THÊM UTILITY FUNCTION
const fixImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // Nếu đã có protocol, trả về nguyên vẹn
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Nếu bắt đầu bằng /uploads/, thêm API_URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_URL}${imageUrl}`;
  }
  
  // Nếu bắt đầu bằng uploads/, thêm API_URL và /
  if (imageUrl.startsWith('uploads/')) {
    return `${API_URL}/${imageUrl}`;
  }
  
  return imageUrl;
};

// SỬA CÁC INTERFACE GIỮ NGUYÊN...
export interface Post {
  id: number;
  title: string;
  description: string;
  images?: string[];
  user_id: number;
  topic_id?: number;
  company_id?: number;
  status: string;
  is_pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
  topic?: {
    id: number;
    name: string;
    slug: string;
  };
  company?: {
    id: number;
    name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  comments_count?: number;
  points?: number;
}

export interface CreatePostData {
  title: string;
  description: string;
  images?: string[];
  topic_id?: number;
  tag_ids?: number[];
}

export interface UpdatePostData {
  title?: string;
  description?: string;
  images?: string[];
  topic_id?: number;
  tag_ids?: number[];
}

export interface QueryPostParams {
  page?: number;
  limit?: number;
  status?: string;
  topic_id?: number;
  company_id?: number;
  is_pinned?: boolean;
  search?: string;
  user_id?: number;
  include_deleted?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// SỬA HÀM getPosts
export const getPosts = async (params: QueryPostParams = {}) => {
  const res = await axios.get(`${API_URL}/posts`, {
    params,
    headers: getAuthHeaders(),
  });
  
  const result = res.data;
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map((post: any) => {
      if (post.images && Array.isArray(post.images)) {
        post.images = post.images.map(fixImageUrl);
      }
      return post;
    });
  }
  
  return result;
};

// SỬA HÀM getPost
export const getPost = async (id: number) => {
  const res = await axios.get(`${API_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });
  
  const post = res.data;
  if (post.images && Array.isArray(post.images)) {
    post.images = post.images.map(fixImageUrl);
  }
  
  return post;
};

// GIỮ NGUYÊN createPost và updatePost...
export const createPost = async (data: CreatePostData) => {
  const res = await axios.post(`${API_URL}/posts`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updatePost = async (id: number, data: UpdatePostData) => {
  const res = await axios.patch(`${API_URL}/posts/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const deletePost = async (id: number) => {
  const res = await axios.delete(`${API_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// SỬA HÀM uploadPostImages
export const uploadPostImages = async (id: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const res = await axios.post(`${API_URL}/posts/${id}/upload-images`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
  
  const result = res.data;
  if (result.images) {
    result.images = result.images.map(fixImageUrl);
  }
  
  return result;
};

// SỬA HÀM uploadTempImages
export const uploadTempImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const res = await axios.post(`${API_URL}/posts/upload-temp-images`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
  
  const result = res.data;
  if (result.images) {
    result.images = result.images.map(fixImageUrl);
  }
  
  return result;
};

// GIỮ NGUYÊN các hàm còn lại...
export const deletePostImage = async (id: number, imageIndex: number) => {
  const res = await axios.delete(`${API_URL}/posts/${id}/images/${imageIndex}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getMyPosts = async (params: QueryPostParams = {}) => {
  const res = await axios.get(`${API_URL}/posts/my-posts`, {
    params,
    headers: getAuthHeaders(),
  });
  
  const result = res.data;
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map((post: any) => {
      if (post.images && Array.isArray(post.images)) {
        post.images = post.images.map(fixImageUrl);
      }
      return post;
    });
  }
  
  return result;
};

export const updatePostStatus = async (id: number, status: string) => {
  const res = await axios.patch(`${API_URL}/posts/${id}/status`, { status }, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const togglePinPost = async (id: number) => {
  const res = await axios.patch(`${API_URL}/posts/${id}/toggle-pin`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data;
};