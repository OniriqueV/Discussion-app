// api/commentApi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  parent_id?: number;
  is_solution: boolean;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
  replies: Comment[];
  isLiked: boolean;
  isDisliked: boolean;
}

export interface CreateCommentData {
  post_id: number;
  content: string;
  parent_id?: number;
}

export interface UpdateCommentData {
  content: string;
}

// Get comments by post ID with nested structure
export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  try {
    const res = await axios.get(`${API_URL}/comments/post/${postId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Create new comment or reply
export const createComment = async (data: CreateCommentData): Promise<Comment> => {
  try {
    const res = await axios.post(`${API_URL}/comments`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Mark comment as solution (toggle)
export const markCommentAsSolution = async (commentId: number): Promise<Comment> => {
  try {
    const res = await axios.patch(`${API_URL}/comments/${commentId}/mark-solution`, {}, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error('Error marking comment as solution:', error);
    throw error;
  }
};

// Toggle like on comment
export const toggleLikeComment = async (commentId: number): Promise<{ likes: number; isLiked: boolean }> => {
  try {
    const res = await axios.post(`${API_URL}/comments/${commentId}/toggle-like`, {}, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Update comment content
export const updateComment = async (commentId: number, data: UpdateCommentData): Promise<Comment> => {
  try {
    const res = await axios.patch(`${API_URL}/comments/${commentId}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Delete comment (soft delete)
export const deleteComment = async (commentId: number): Promise<{ message: string }> => {
  try {
    const res = await axios.delete(`${API_URL}/comments/${commentId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};