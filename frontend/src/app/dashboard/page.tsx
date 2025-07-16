"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, MessageCircle, Calendar, TrendingUp, Users, FileText, Tag, ChevronRight, ChevronLeft, MoreHorizontal, Activity, Clock, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

// Mock data
const topicsMock = [
  { id: "1", name: "React", postCount: 12, createdAt: "2024-12-01T00:00:00Z" },
  { id: "2", name: "Next.js", postCount: 8, createdAt: "2025-02-15T00:00:00Z" },
  { id: "3", name: "TypeScript", postCount: 20, createdAt: "2025-01-10T00:00:00Z" },
  { id: "4", name: "Node.js", postCount: 14, createdAt: "2025-03-05T00:00:00Z" },
  { id: "5", name: "Express", postCount: 5, createdAt: "2024-11-20T00:00:00Z" },
  { id: "6", name: "MongoDB", postCount: 10, createdAt: "2025-01-25T00:00:00Z" },
  { id: "7", name: "GraphQL", postCount: 7, createdAt: "2025-04-10T00:00:00Z" },
  { id: "8", name: "Redux", postCount: 9, createdAt: "2024-10-05T00:00:00Z" },
  { id: "9", name: "Jest", postCount: 4, createdAt: "2024-09-01T00:00:00Z" },
  { id: "10", name: "Tailwind CSS", postCount: 13, createdAt: "2025-05-20T00:00:00Z" },
];

const postsMock = [
  {
    id: "1",
    title: "Fix hydration mismatch in Next.js",
    description: "I'm getting hydration errors on my topic page...",
    author: "admin1",
    topicId: "1",
    status: "not_resolved",
    tagIds: ["1", "2"],
    createdAt: "2025-06-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Authentication in React",
    description: "How to use Firebase with custom hooks...",
    author: "user2",
    topicId: "2",
    status: "resolved",
    tagIds: ["3"],
    createdAt: "2025-06-03T15:00:00Z",
  },
  {
    id: "3",
    title: "Improve API performance",
    description: "Caching strategies for better API performance.",
    author: "admin2",
    topicId: "2",
    status: "resolved",
    tagIds: ["5", "13"],
    createdAt: "2025-06-05T12:00:00Z",
  },
  {
    id: "4",
    title: "Unit testing in Node.js",
    description: "How to use Jest and other testing tools in Node.js.",
    author: "user1",
    topicId: "3",
    status: "not_resolved",
    tagIds: ["2", "7"],
    createdAt: "2025-06-06T08:30:00Z",
  },
  {
    id: "5",
    title: "CI/CD with GitHub Actions",
    description: "Setting up workflows with GitHub Actions.",
    author: "dev5",
    topicId: "4",
    status: "resolved",
    tagIds: ["10", "11"],
    createdAt: "2025-06-07T14:15:00Z",
  },
  {
    id: "7",
    title: "API security best practices",
    description: "How to protect your APIs from attacks.",
    author: "user4",
    topicId: "1",
    status: "not_resolved",
    tagIds: ["5", "6"],
    createdAt: "2025-06-10T11:45:00Z",
  },
  {
    id: "8",
    title: "Use cases for Redis caching",
    description: "How Redis can optimize your application.",
    author: "user2",
    topicId: "6",
    status: "resolved",
    tagIds: ["3", "13"],
    createdAt: "2025-06-11T13:10:00Z",
  },
  {
    id: "15",
    title: "Design patterns in React",
    description: "Using container and presentational components.",
    author: "dev1",
    topicId: "1",
    status: "not_resolved",
    tagIds: ["1", "9"],
    createdAt: "2025-06-18T10:50:00Z",
  },
];

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: "blue" | "green" | "red" | "purple"|"amber";
  trend?: number;
}
const StatsCard = ({ title, value, icon: Icon, color = "blue" }: StatsCardProps) => (
  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-medium text-gray-900">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);
interface Topic {
  id: string;
  name: string;
  postCount: number;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  author: string;
  topicId: string;
  status: string;
  tagIds : string[];
  createdAt: string;
}

interface TopicCardProps {
  topic: Topic;
  posts: Post[];
  comments: number;
}

const TopicCard = ({ topic, posts, comments }: TopicCardProps) => {
  const topicPosts = posts.filter(post => post.topicId === topic.id);
  const resolvedPosts = topicPosts.filter(post => post.status === "resolved");
  const unresolvedPosts = topicPosts.filter(post => post.status === "not_resolved");

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {topic.postCount} posts
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Resolved</span>
          <span className="font-medium text-green-600">{resolvedPosts.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Unresolved</span>
          <span className="font-medium text-red-600">{unresolvedPosts.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Comments</span>
          <span className="font-medium text-gray-900">{comments}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Created</span>
          <span className="font-medium text-gray-700">
            {new Date(topic.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

interface Post {
  id: string;
  title: string;
  description: string;
  author: string;
  topicId: string;
  status: string;
  tagIds: string[];
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  topicName: string;
}

const PostCard = ({ post, topicName }: PostCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "text-green-600 bg-green-100";
      case "not_resolved": return "text-red-600 bg-red-100";
      case "deleted_by_admin": return "text-gray-600 bg-gray-100";
      case "deleted_by_company": return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
          {post.status.replace("_", " ")}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>By {post.author}</span>
          <span className="flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            {topicName}
          </span>
        </div>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Trước
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{(currentPage - 1) * 6 + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(currentPage * 6, totalPages * 6)}</span> của{' '}
            <span className="font-medium">{totalPages * 6}</span> kết quả
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default function ModernDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(postsMock);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [user, setUser] = useState<{ credential: string ;name?: string;
  email?: string;} | null>(null);

  useEffect(() => {
    setUser({ credential: "mock-jwt-token-12345" });
  }, []);

  useEffect(() => {
    const filtered = postsMock.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm]);

  // Statistics
  const totalPosts = postsMock.length;
  const resolvedPosts = postsMock.filter(post => post.status === "resolved").length;
  const unresolvedPosts = postsMock.filter(post => post.status === "not_resolved").length;
  const totalTopics = topicsMock.length;

    const getTopicInfo = (topicId: string): { name: string } => {
    const topic = topicsMock.find(t => t.id === topicId);
      return topic ? { name: topic.name } : { name: "Unknown" };
    };



  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const displayedTopics = showAllTopics ? topicsMock : topicsMock.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h2>
              <p className="text-blue-100 text-lg">
                Xin chào <span className="font-semibold">{user?.name || "User"}</span>
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Hãy cùng khám phá những nội dung mới nhất hôm nay
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Activity className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Tổng bài viết" value={totalPosts} icon={FileText} color="blue" trend={12} />
          <StatsCard title="Đã giải quyết" value={resolvedPosts} icon={CheckCircle} color="green" trend={8} />
          <StatsCard title="Chờ xử lý" value={unresolvedPosts} icon={Clock} color="amber" trend={-3} />
          <StatsCard title="Chủ đề" value={totalTopics} icon={Tag} color="purple" trend={5} />
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Tìm kiếm bài viết</h3>
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc tác giả..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <p className="mt-3 text-sm text-gray-600">
              Tìm thấy <span className="font-medium text-blue-600">{filteredPosts.length}</span> kết quả cho "{searchTerm}"
            </p>
          )}
        </div>

        {/* Topics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Tất cả chủ đề</h3>
            <button
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span>{showAllTopics ? "Thu gọn" : "Xem tất cả"}</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showAllTopics ? 'rotate-90' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTopics.map((topic) => {
            const topicPosts = postsMock.filter(post => post.topicId === topic.id);
            const commentsCount = topicPosts.length * 2; // ví dụ mỗi post có 2 comment

            return (
               <Link key={topic.id} href={`/topics/${topic.id}`} className="block">
                <TopicCard topic={topic} posts={postsMock} comments={commentsCount} />
              </Link>
            );
          })}
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {searchTerm ? `Kết quả tìm kiếm (${filteredPosts.length})` : "Bài viết mới nhất"}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Cập nhật liên tục</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => {
                const topicInfo = getTopicInfo(post.topicId);
                return (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    topicName={topicInfo.name}
                    
                  />
                );
              })}
            </div>
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy bài viết nào phù hợp</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}