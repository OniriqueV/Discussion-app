"use client";
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  MessageCircle, 
  ThumbsUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Pin,
  Send,
  Heart,
  Reply,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { getPost, Post } from '@/api/postApi';
import { 
  getCommentsByPostId, 
  createComment, 
  markCommentAsSolution, 
  toggleLikeComment,
  updateComment,
  deleteComment,
  Comment,
  CreateCommentData,
  UpdateCommentData
} from '@/api/commentApi';
import { useCurrentUser } from '@/hooks/useAuthRedirect';
import { toast } from 'react-toastify';
import axios from 'axios';

interface CommentCardProps {
  comment: Comment;
  postAuthor: string;
  postAuthorId: number;
  currentUser: any;
  onToggleResolve: (commentId: number) => void;
  onLike: (commentId: number) => void;
  onReply: (parentId: number, content: string) => void;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  level: number;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  postAuthor,
  postAuthorId,
  currentUser,
  onToggleResolve,
  onLike,
  onReply,
  onEdit,
  onDelete,
  level
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);

  const canResolve = currentUser?.id === postAuthorId;
  const isAuthor = comment.user?.id === currentUser?.id;
  const canEditDelete = isAuthor || currentUser?.role === 'admin';

  const handleReply = async () => {
    if (replyContent.trim()) {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      await onEdit(comment.id, editContent);
      setShowEditForm(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      await onDelete(comment.id);
    }
  };

  const renderReplies = (replies: Comment[], currentLevel: number) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        {replies.map((reply) => (
          <CommentCard
            key={reply.id}
            comment={reply}
            postAuthor={postAuthor}
            postAuthorId={postAuthorId}
            currentUser={currentUser}
            onToggleResolve={onToggleResolve}
            onLike={onLike}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            level={currentLevel + 1}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className={`bg-white rounded-lg border p-4 ${comment.is_solution ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md transition-shadow'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {comment.user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{comment.user?.full_name}</span>
                {comment.user?.full_name === postAuthor && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Tác giả
                  </span>
                )}
                {isAuthor && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Bạn
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{new Date(comment.created_at).toLocaleString('vi-VN')}</span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-gray-400">(đã chỉnh sửa)</span>
                )}
              </div>
            </div>
          </div>
          
          {comment.is_solution && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Giải pháp</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          {showEditForm ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={5000}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {editContent.length}/5000 ký tự
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!editContent.trim() || editContent === comment.content}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                comment.isLiked 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">{comment.likes}</span>
            </button>
            
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span className="text-sm">Trả lời</span>
            </button>

            {canEditDelete && (
              <>
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-yellow-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-sm">Sửa</span>
                </button>
                
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Xóa</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {canResolve && (
              <button
                onClick={() => onToggleResolve(comment.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  comment.is_solution
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {comment.is_solution ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Bỏ giải pháp</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Đánh dấu giải pháp</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết phản hồi..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {replyContent.length}/5000 ký tự
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span>Gửi</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && renderReplies(comment.replies, level)}
    </div>
  );
};

interface PostDetailProps {
  postId: string;
}

const PostDetail: React.FC<PostDetailProps> = ({ postId }) => {
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load post and comments
  useEffect(() => {
    const loadPostAndComments = async () => {
      try {
        setLoading(true);
        
        // Load post
        const postData = await getPost(parseInt(postId));
        setPost(postData);
        
        // Load comments with nested structure
        const commentsData = await getCommentsByPostId(parseInt(postId));
        setComments(commentsData);
        
      } catch (error) {
        console.error("Error loading post and comments:", error);
        toast.error("Lỗi khi tải bài viết");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPostAndComments();
    }
  }, [postId]);
  // 2. useEffect: Tăng lượt xem
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    function getAuthHeaders() {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    }

    useEffect(() => {
      if (!postId) return;

      axios.patch(`${API_URL}/posts/${postId}/view`, {}, {
        headers: getAuthHeaders(),
      }).catch((err) => {
        console.error("Failed to increment view:", err);
      });
    }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser || !post || submittingComment) return;

    try {
      setSubmittingComment(true);
      const commentData: CreateCommentData = {
        post_id: post.id,
        content: newComment.trim()
      };
      
      const comment = await createComment(commentData);
      
      setComments(prev => [...prev, comment]);
      setNewComment("");
      toast.success("Đã thêm bình luận");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Lỗi khi thêm bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleResolve = async (commentId: number) => {
    try {
      const updatedComment = await markCommentAsSolution(commentId);
      
      // Update comments state
      const updateCommentInState = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, is_solution: updatedComment.is_solution };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentInState(comment.replies) };
          }
          return comment;
        });
      };
      
      setComments(prev => updateCommentInState(prev));
      
      // Update post status if needed
      if (updatedComment.is_solution) {
        setPost(prev => prev ? { ...prev, status: 'solve' } : null);
        toast.success("Đã đánh dấu giải pháp và cập nhật trạng thái bài viết");
      } else {
        setPost(prev => prev ? { ...prev, status: 'problem' } : null);
        toast.success("Đã bỏ đánh dấu giải pháp");
      }
    } catch (error) {
      console.error("Error toggling resolve:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleLike = async (commentId: number) => {
    try {
      const result = await toggleLikeComment(commentId);
      
      // Update comments state recursively
      const updateCommentInState = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: result.likes,
              isLiked: result.isLiked
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentInState(comment.replies) };
          }
          return comment;
        });
      };
      
      setComments(prev => updateCommentInState(prev));
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Lỗi khi thích bình luận");
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    if (!currentUser || !post) return;

    try {
      const replyData: CreateCommentData = {
        post_id: post.id,
        content: content.trim(),
        parent_id: parentId
      };
      
      const reply = await createComment(replyData);
      
      // Add reply to the correct parent comment
      const updateCommentInState = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return { 
              ...comment, 
              replies: [...(comment.replies || []), reply] 
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentInState(comment.replies) };
          }
          return comment;
        });
      };
      
      setComments(prev => updateCommentInState(prev));
      toast.success("Đã thêm phản hồi");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Lỗi khi thêm phản hồi");
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    try {
      const updateData: UpdateCommentData = { content };
      const updatedComment = await updateComment(commentId, updateData);
      
      // Update comment in state recursively
      const updateCommentInState = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { 
              ...comment, 
              content: updatedComment.content, 
              updated_at: updatedComment.updated_at 
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentInState(comment.replies) };
          }
          return comment;
        });
      };
      
      setComments(prev => updateCommentInState(prev));
      toast.success("Đã cập nhật bình luận");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Lỗi khi cập nhật bình luận");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      
      // Remove comment from state recursively
      const removeCommentFromState = (comments: Comment[]): Comment[] => {
        return comments.filter(comment => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeCommentFromState(comment.replies);
          }
          return true;
        });
      };
      
      setComments(prev => removeCommentFromState(prev));
      toast.success("Đã xóa bình luận");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Lỗi khi xóa bình luận");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-gray-600">Bài viết bạn tìm kiếm không tồn tại.</p>
          <Link href="/posts" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "solve": return "text-green-600 bg-green-100";
      case "problem": return "text-red-600 bg-red-100";
      case "reject_by_admin_or_company_acc": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "solve": return <CheckCircle className="h-4 w-4" />;
      case "problem": return <AlertCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'problem': 'Chưa giải quyết',
      'solve': 'Đã giải quyết',
      'reject_by_admin_or_company_acc': 'Bị từ chối'
    };
    return statusMap[status] || status;
  };

  // Calculate stats
  const countCommentsRecursively = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countCommentsRecursively(comment.replies) : 0);
    }, 0);
  };

  const countLikesRecursively = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      const commentLikes = comment.likes || 0;
      const replyLikes = comment.replies ? countLikesRecursively(comment.replies) : 0;
      return count + commentLikes + replyLikes;
    }, 0);
  };

  const countSolutionsRecursively = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      const isSolution = comment.is_solution ? 1 : 0;
      const replySolutions = comment.replies ? countSolutionsRecursively(comment.replies) : 0;
      return count + isSolution + replySolutions;
    }, 0);
  };

  const totalComments = countCommentsRecursively(comments);
  const totalLikes = countLikesRecursively(comments);
  const totalSolutions = countSolutionsRecursively(comments);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/posts" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Danh sách bài viết
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.full_name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {post.is_pinned && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Pin className="h-4 w-4" />
                      <span className="text-sm font-medium">Bài ghim</span>
                    </div>
                  )}
                  <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${getStatusColor(post.status)}`}>
                    {getStatusIcon(post.status)}
                    <span>{getStatusDisplay(post.status)}</span>
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <div 
                className="text-gray-700 text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            </div>

            {/* Display images if any */}
            {post.images && post.images.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {post.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.user?.full_name}</p>
                    <p className="text-sm text-gray-500">{post.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views} lượt xem</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{totalComments} bình luận</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{totalLikes} lượt thích</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Bình luận ({totalComments})
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{totalSolutions} đã giải quyết</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span>{totalLikes} lượt thích</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Comment */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Thêm bình luận</h4>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {currentUser?.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={5000}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">
                  {newComment.length}/5000 ký tự
                </span>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span>{submittingComment ? 'Đang gửi...' : 'Đăng bình luận'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  postAuthor={post.user?.full_name || ''}
                  postAuthorId={post.user?.id || 0}
                  currentUser={currentUser}
                  onToggleResolve={handleToggleResolve}
                  onLike={handleLike}
                  onReply={handleReply}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  level={0}
                />
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;