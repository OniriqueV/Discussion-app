"use client";
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Eye, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Pin,
  PinOff,
  Clock,
  Send,
  Star,
  Award,
  Edit,
  Trash2,
  MoreHorizontal,
  Heart,
  Reply
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const postDetailMock = {
  id: "1",
  title: "Fix hydration mismatch in Next.js",
  description: "I'm getting hydration errors on my topic page. The issue seems to be related to server-side rendering and client-side rendering differences. When I navigate to the page, I see the following error in the console:\n\nWarning: Text content did not match. Server: \"Loading...\" Client: \"Actual Content\"\n\nThis happens because the server renders \"Loading...\" initially, but the client renders the actual content after hydration. How can I fix this issue?",
  author: "admin1",
  topicId: "1",
  topicName: "React",
  status: "not_resolved",
  createdAt: "2025-06-01T10:00:00Z",
  updatedAt: "2025-06-10T15:30:00Z",
  isPinned: true,
  views: 234,
  points: 15,
  userPoints: 1250
};

const commentsMock = [
  {
    id: "1",
    postId: "1",
    author: "dev_expert",
    content: "This is a common issue with Next.js SSR. The problem is that your component is showing different content on the server vs client. You need to ensure that the initial render is consistent.\n\nHere's what you can do:\n1. Use a loading state that's the same on both server and client\n2. Use dynamic imports with ssr: false for client-only components\n3. Use useEffect to update the state after hydration",
    createdAt: "2025-06-01T11:30:00Z",
    updatedAt: "2025-06-01T11:30:00Z",
    likes: 12,
    dislikes: 1,
    isResolved: true,
    resolvedBy: "admin1",
    resolvedAt: "2025-06-01T12:00:00Z",
    parentId: null,
    userPoints: 890,
    isLiked: false,
    isDisliked: false
  },
  {
    id: "2",
    postId: "1",
    author: "react_dev",
    content: "I had the same issue! What worked for me was using the `useIsomorphicLayoutEffect` hook. It ensures that the effect runs on the server during SSR and on the client during hydration.",
    createdAt: "2025-06-01T14:20:00Z",
    updatedAt: "2025-06-01T14:20:00Z",
    likes: 5,
    dislikes: 0,
    isResolved: false,
    parentId: null,
    userPoints: 320,
    isLiked: true,
    isDisliked: false
  },
  {
    id: "3",
    postId: "1",
    author: "nextjs_fan",
    content: "Great explanation! Can you provide a code example of how to implement this properly?",
    createdAt: "2025-06-01T15:45:00Z",
    updatedAt: "2025-06-01T15:45:00Z",
    likes: 2,
    dislikes: 0,
    isResolved: false,
    parentId: "1",
    userPoints: 150,
    isLiked: false,
    isDisliked: false
  },
  {
    id: "4",
    postId: "1",
    author: "junior_dev",
    content: "Thanks for the help! This solution worked perfectly for my project.",
    createdAt: "2025-06-02T09:15:00Z",
    updatedAt: "2025-06-02T09:15:00Z",
    likes: 3,
    dislikes: 0,
    isResolved: false,
    parentId: "1",
    userPoints: 45,
    isLiked: false,
    isDisliked: false
  }
];

interface Post {
  id: string;
  title: string;
  description: string;
  author: string;
  topicId: string;
  topicName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  views: number;
  points: number;
  userPoints: number;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  parentId?: string;
  userPoints: number;
  isLiked: boolean;
  isDisliked: boolean;
}

interface User {
  credential: string;
  name: string;
  role: string;
  points: number;
}

interface CommentCardProps {
  comment: Comment;
  postAuthor: string;
  currentUser: User;
  onToggleResolve: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onReply: (commentId: string) => void;
  replies: Comment[];
  level: number;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  postAuthor,
  currentUser,
  onToggleResolve,
  onLike,
  onDislike,
  onReply,
  replies,
  level
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const canResolve = currentUser.name === postAuthor;
  const isAuthor = comment.author === currentUser.name;

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const getStatusColor = (isResolved: boolean) => {
    return isResolved ? "text-green-600 bg-green-100" : "";
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className={`bg-white rounded-lg border p-4 ${comment.isResolved ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md transition-shadow'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {comment.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{comment.author}</span>
                <span className="text-xs text-gray-500">
                  {comment.userPoints} điểm
                </span>
                {comment.author === postAuthor && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Tác giả
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span>{new Date(comment.createdAt).toLocaleTimeString('vi-VN')}</span>
              </div>
            </div>
          </div>
          
          {comment.isResolved && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Đã giải quyết</span>
              </div>
              <div className="text-xs text-gray-500">
                bởi {comment.resolvedBy}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
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
                onClick={() => onDislike(comment.id)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                  comment.isDisliked 
                    ? 'bg-red-100 text-red-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm">{comment.dislikes}</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span className="text-sm">Trả lời</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {canResolve && (
              <button
                onClick={() => onToggleResolve(comment.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  comment.isResolved
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {comment.isResolved ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Bỏ giải quyết</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Đánh dấu giải quyết</span>
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
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowReplyForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReply}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              postAuthor={postAuthor}
              currentUser={currentUser}
              onToggleResolve={onToggleResolve}
              onLike={onLike}
              onDislike={onDislike}
              onReply={onReply}
              replies={[]}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PostDetailProps {
  postId: string;
}

const PostDetail: React.FC<PostDetailProps> = ({ postId }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user authentication
  useEffect(() => {
    setUser({ 
      credential: "mock-jwt-token-12345", 
      name: "admin1", 
      role: "admin",
      points: 1500
    });
  }, []);

  // Load post and comments
  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      if (postId === "1") {
        setPost(postDetailMock);
        setComments(commentsMock as Comment[]);
      }
      setLoading(false);
    }, 500);
  }, [postId]);

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      const comment: Comment = {
        id: Date.now().toString(),
        postId: postId,
        author: user.name,
        content: newComment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        isResolved: false,
        
        userPoints: user.points,
        isLiked: false,
        isDisliked: false
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment("");
    }
  };

  const handleToggleResolve = (commentId: string) => {
    if (!user) return;
    
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        if (comment.isResolved) {
          return {
            ...comment,
            isResolved: false,
            resolvedBy: undefined,
            resolvedAt: undefined
          };
        } else {
          // Add point to comment author
          return {
            ...comment,
            isResolved: true,
            resolvedBy: user.name,
            resolvedAt: new Date().toISOString()
          };
        }
      }
      return comment;
    }));
  };

  const handleLike = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        if (comment.isLiked) {
          return {
            ...comment,
            isLiked: false,
            likes: comment.likes - 1
          };
        } else {
          return {
            ...comment,
            isLiked: true,
            isDisliked: false,
            likes: comment.likes + 1,
            dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes
          };
        }
      }
      return comment;
    }));
  };

  const handleDislike = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        if (comment.isDisliked) {
          return {
            ...comment,
            isDisliked: false,
            dislikes: comment.dislikes - 1
          };
        } else {
          return {
            ...comment,
            isDisliked: true,
            isLiked: false,
            dislikes: comment.dislikes + 1,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes
          };
        }
      }
      return comment;
    }));
  };

  const handleReply = (parentCommentId: string) => {
    // This would typically open a reply form specific to the comment
    console.log('Reply to comment:', parentCommentId);
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
          <Link href="/dashboard" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "text-green-600 bg-green-100";
      case "not_resolved": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      case "not_resolved": return <AlertCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  // Organize comments by parent-child relationship
  const topLevelComments = comments.filter(comment => !comment.parentId);
  const getCommentReplies = (commentId: string) => 
    comments.filter(comment => comment.parentId === commentId);

  const resolvedComments = comments.filter(comment => comment.isResolved);
  const totalLikes = comments.reduce((sum, comment) => sum + comment.likes, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/topics/${post.topicId}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-1" />
                {post.topicName}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{user?.points} điểm</span>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
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
                  {post.isPinned && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Pin className="h-4 w-4" />
                      <span className="text-sm font-medium">Bài ghim</span>
                    </div>
                  )}
                  <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${getStatusColor(post.status)}`}>
                    {getStatusIcon(post.status)}
                    <span>{post.status === "resolved" ? "Đã giải quyết" : "Chưa giải quyết"}</span>
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {post.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-500">{post.userPoints} điểm</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
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
                  <span>{comments.length} bình luận</span>
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
              Bình luận ({comments.length})
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{resolvedComments.length} đã giải quyết</span>
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
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Đăng bình luận</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6">
            <div className="space-y-6">
              {topLevelComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  postAuthor={post.author}
                  currentUser={user!}
                  onToggleResolve={handleToggleResolve}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onReply={handleReply}
                  replies={getCommentReplies(comment.id)}
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