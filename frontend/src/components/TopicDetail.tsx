"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Pin, 
  PinOff, 
  Eye, 
  MessageCircle, 
  Calendar, 
  User, 
  Tag, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

// Mock data - expanded with pinned posts
const topicsMock = [
  { id: "1", name: "React", postCount: 12, createdAt: "2024-12-01T00:00:00Z", description: "Thảo luận về React và các best practices" },
  { id: "2", name: "Next.js", postCount: 8, createdAt: "2025-02-15T00:00:00Z", description: "Framework React cho production" },
  { id: "3", name: "TypeScript", postCount: 20, createdAt: "2025-01-10T00:00:00Z", description: "JavaScript với type safety" },
  { id: "4", name: "Node.js", postCount: 14, createdAt: "2025-03-05T00:00:00Z", description: "Server-side JavaScript runtime" },
];

const postsMock = [
  {
    id: "1",
    title: "Fix hydration mismatch in Next.js",
    description: "I'm getting hydration errors on my topic page. The issue seems to be related to server-side rendering and client-side rendering differences.",
    author: "admin1",
    topicId: "1",
    status: "not_resolved",
    tagIds: ["1", "2"],
    createdAt: "2025-06-01T10:00:00Z",
    isPinned: true,
    views: 234,
    comments: 12,
    lastActivity: "2025-06-10T15:30:00Z"
  },
  {
    id: "2",
    title: "Authentication in React",
    description: "How to use Firebase with custom hooks for managing authentication state across components.",
    author: "user2",
    topicId: "1",
    status: "resolved",
    tagIds: ["3"],
    createdAt: "2025-06-03T15:00:00Z",
    isPinned: false,
    views: 156,
    comments: 8,
    lastActivity: "2025-06-09T12:15:00Z"
  },
  {
    id: "3",
    title: "Improve API performance",
    description: "Caching strategies for better API performance. Looking into Redis and in-memory caching solutions.",
    author: "admin2",
    topicId: "1",
    status: "resolved",
    tagIds: ["5", "13"],
    createdAt: "2025-06-05T12:00:00Z",
    isPinned: true,
    views: 89,
    comments: 5,
    lastActivity: "2025-06-08T09:45:00Z"
  },
  {
    id: "4",
    title: "Unit testing in React components",
    description: "How to use Jest and React Testing Library for comprehensive component testing.",
    author: "user1",
    topicId: "1",
    status: "not_resolved",
    tagIds: ["2", "7"],
    createdAt: "2025-06-06T08:30:00Z",
    isPinned: false,
    views: 67,
    comments: 3,
    lastActivity: "2025-06-07T14:20:00Z"
  },
  {
    id: "5",
    title: "State management with Context API",
    description: "When to use Context API vs external state management libraries like Redux or Zustand.",
    author: "dev5",
    topicId: "1",
    status: "resolved",
    tagIds: ["10", "11"],
    createdAt: "2025-06-07T14:15:00Z",
    isPinned: false,
    views: 145,
    comments: 15,
    lastActivity: "2025-06-11T11:30:00Z"
  },
  {
    id: "6",
    title: "React Performance Optimization",
    description: "Tips and tricks for optimizing React applications including memo, useMemo, and useCallback.",
    author: "user4",
    topicId: "1",
    status: "not_resolved",
    tagIds: ["5", "6"],
    createdAt: "2025-06-08T11:45:00Z",
    isPinned: false,
    views: 198,
    comments: 22,
    lastActivity: "2025-06-12T16:45:00Z"
  },
  {
    id: "7",
    title: "Custom Hooks Best Practices",
    description: "How to create reusable custom hooks that follow React conventions and best practices.",
    author: "user2",
    topicId: "1",
    status: "resolved",
    tagIds: ["3", "13"],
    createdAt: "2025-06-09T13:10:00Z",
    isPinned: false,
    views: 112,
    comments: 7,
    lastActivity: "2025-06-10T10:15:00Z"
  },
  {
    id: "8",
    title: "React Router v6 Migration Guide",
    description: "Step by step guide to migrate from React Router v5 to v6 with breaking changes explained.",
    author: "dev1",
    topicId: "1",
    status: "not_resolved",
    tagIds: ["1", "9"],
    createdAt: "2025-06-10T10:50:00Z",
    isPinned: false,
    views: 78,
    comments: 4,
    lastActivity: "2025-06-11T08:20:00Z"
  },
];

interface Topic {
  id: string;
  name: string;
  postCount: number;
  createdAt: string;
  description?: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  author: string;
  topicId: string;
  status: string;
  tagIds: string[];
  createdAt: string;
  isPinned: boolean;
  views: number;
  comments: number;
  lastActivity: string;
}

interface PostDetailCardProps {
  post: Post;
  onTogglePin: (postId: string) => void;
  canPin: boolean;
}

const PostDetailCard: React.FC<PostDetailCardProps> = ({ post, onTogglePin, canPin }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "text-green-600 bg-green-100";
      case "not_resolved": return "text-red-600 bg-red-100";
      case "deleted_by_admin": return "text-gray-600 bg-gray-100";
      case "deleted_by_company": return "text-orange-600 bg-orange-100";
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 ${post.isPinned ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {post.isPinned && (
              <div className="flex items-center space-x-1 text-blue-600">
                <Pin className="h-4 w-4" />
                <span className="text-xs font-medium">Ghim</span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
              {post.title}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(post.status)}`}>
              {getStatusIcon(post.status)}
              <span>{post.status === "resolved" ? "Đã giải quyết" : "Chưa giải quyết"}</span>
            </span>
            {canPin && (
              <button
                onClick={() => onTogglePin(post.id)}
                className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${post.isPinned ? 'text-blue-600' : 'text-gray-400'}`}
                title={post.isPinned ? "Bỏ ghim" : "Ghim bài viết"}
              >
                {post.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(post.lastActivity).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FilterSortProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filterStatus: string;
  onSortChange: (field: string) => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onFilterStatusChange: (status: string) => void;
}

const FilterSort: React.FC<FilterSortProps> = ({
  sortBy,
  sortOrder,
  filterStatus,
  onSortChange,
  onSortOrderChange,
  onFilterStatusChange
}) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="not_resolved">Chưa giải quyết</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Sắp xếp theo:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="createdAt">Ngày tạo</option>
          <option value="lastActivity">Hoạt động cuối</option>
          <option value="views">Lượt xem</option>
          <option value="comments">Bình luận</option>
        </select>
        
        <button
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          title={sortOrder === 'asc' ? 'Sắp xếp giảm dần' : 'Sắp xếp tăng dần'}
        >
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> của{' '}
            <span className="font-medium">{totalPages * 10}</span> kết quả
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                } ${typeof page !== 'number' ? 'cursor-default' : 'cursor-pointer'}`}
                disabled={typeof page !== 'number'}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

interface TopicDetailProps {
  topicId: string;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topicId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<{ credential: string; name?: string; role?: string } | null>(null);
  
  const itemsPerPage = 3;

  // Mock user authentication
  useEffect(() => {
    setUser({ credential: "mock-jwt-token-12345", name: "John Doe", role: "admin" });
  }, []);

  // Get topic info
  const topic = topicsMock.find(t => t.id === topicId);
  
  // Get posts for this topic
  useEffect(() => {
    const topicPosts = postsMock.filter(post => post.topicId === topicId);
    setPosts(topicPosts);
  }, [topicId]);

  // Filter and sort posts
  const filteredAndSortedPosts = React.useMemo(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || post.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort posts
    filtered.sort((a, b) => {
      // Always put pinned posts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "lastActivity":
          aValue = new Date(a.lastActivity).getTime();
          bValue = new Date(b.lastActivity).getTime();
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        case "comments":
          aValue = a.comments;
          bValue = b.comments;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [posts, searchTerm, sortBy, sortOrder, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredAndSortedPosts.slice(startIndex, endIndex);

  // Handle pin toggle
  const handleTogglePin = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isPinned: !post.isPinned } : post
    ));
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, filterStatus]);

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy chủ đề</h1>
          <p className="text-gray-600">Chủ đề bạn tìm kiếm không tồn tại.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const canPin = user?.role === "admin" || user?.role === "moderator";
  const pinnedPosts = filteredAndSortedPosts.filter(post => post.isPinned);
  const resolvedCount = posts.filter(post => post.status === "resolved").length;
  const unresolvedCount = posts.filter(post => post.status === "not_resolved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{topic.name}</h2>
              <p className="text-blue-100 text-lg mb-2">{topic.description}</p>
              <div className="flex items-center space-x-6 text-blue-200">
                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4" />
                  <span>{posts.length} bài viết</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{resolvedCount} đã giải quyết</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{unresolvedCount} chưa giải quyết</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Pin className="h-4 w-4" />
                  <span>{pinnedPosts.length} bài ghim</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Tag className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <FilterSort
              sortBy={sortBy}
              sortOrder={sortOrder}
              filterStatus={filterStatus}
              onSortChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onFilterStatusChange={setFilterStatus}
            />
          </div>
          
          {searchTerm && (
            <p className="mt-3 text-sm text-gray-600">
              Tìm thấy <span className="font-medium text-blue-600">{filteredAndSortedPosts.length}</span> kết quả cho "{searchTerm}"
            </p>
          )}
        </div>

        {/* Posts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Bài viết ({filteredAndSortedPosts.length})
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Cập nhật liên tục</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
                {currentPosts.map((post) => (
                    <Link key={post.id} href={`/posts/detail/${post.id}`} className="block">
                    <PostDetailCard
                        post={post}
                        onTogglePin={handleTogglePin}
                        canPin={canPin}
                    />
                    </Link>
                ))}
                </div>

            {filteredAndSortedPosts.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy bài viết nào phù hợp</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;