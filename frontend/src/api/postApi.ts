import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

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
  sort_order?: 'asc' | 'desc'
}

// Get all posts
export const getPosts = async (params: QueryPostParams = {}) => {
  const res = await axios.get(`${API_URL}/posts`, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Get post by ID
export const getPost = async (id: number) => {
  const res = await axios.get(`${API_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Create new post
export const createPost = async (data: CreatePostData) => {
  const res = await axios.post(`${API_URL}/posts`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Update post
export const updatePost = async (id: number, data: UpdatePostData) => {
  const res = await axios.patch(`${API_URL}/posts/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Delete post
export const deletePost = async (id: number) => {
  const res = await axios.delete(`${API_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Upload images to post
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
  return res.data;
};



// Upload temporary images (for new posts)
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
  return res.data;
};

// Delete image from post
export const deletePostImage = async (id: number, imageIndex: number) => {
  const res = await axios.delete(`${API_URL}/posts/${id}/images/${imageIndex}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Get my posts
export const getMyPosts = async (params: QueryPostParams = {}) => {
  const res = await axios.get(`${API_URL}/posts/my-posts`, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Update post status (admin/ca_user only)
export const updatePostStatus = async (id: number, status: string) => {
  const res = await axios.patch(`${API_URL}/posts/${id}/status`, { status }, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Toggle pin post (admin/ca_user only)
export const togglePinPost = async (id: number) => {
  const res = await axios.patch(`${API_URL}/posts/${id}/toggle-pin`, {}, {
    headers: getAuthHeaders(),
  });
  return res.data;
}; 