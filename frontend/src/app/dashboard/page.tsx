"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, MessageCircle, Calendar, TrendingUp, Users, FileText, Tag, ChevronRight, ChevronLeft, MoreHorizontal, Activity, Clock, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCurrentUser } from "@/hooks/useAuthRedirect";
import { getPosts, Post, QueryPostParams } from '@/api/postApi';
import { topicApi, Topic } from '@/api/topic';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: "blue" | "green" | "red" | "purple"|"amber";
  trend?: number;
  isLoading?: boolean;
}

const StatsCard = ({ title, value, icon: Icon, color = "blue", isLoading = false }: StatsCardProps) => (
  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-medium text-gray-900">
            {isLoading ? (
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

interface TopicCardProps {
  topic: Topic;
  allPosts: Post[];
}

const TopicCard = ({ topic, allPosts }: TopicCardProps) => {
  const topicPosts = allPosts.filter(post => post.topic_id === parseInt(topic.id));
  const resolvedPosts = topicPosts.filter(post => post.status === "solve");
  const unresolvedPosts = topicPosts.filter(post => post.status === "problem");
  const totalComments = topicPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {topicPosts.length} posts
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
          <span className="font-medium text-gray-900">{totalComments}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Created</span>
          <span className="font-medium text-gray-700">
            {new Date(topic.created_at).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  );
};

interface PostCardProps {
  post: Post;
  topicName: string;
}

const PostCard = ({ post, topicName }: PostCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "solve": return "text-green-600 bg-green-100";
      case "problem": return "text-red-600 bg-red-100";
      case "reject_by_admin_or_company_acc": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
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

  return (
    <Link href={`/posts/detail/${post.id}`} className="block">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
              {getStatusDisplay(post.status)}
            </span>
            {post.is_pinned && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Ghim
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2" 
           dangerouslySetInnerHTML={{ __html: post.description.substring(0, 150) + '...' }}>
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>By {post.user?.full_name}</span>
            <span className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              {topicName}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count || 0}</span>
            </div>
            <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </Link>
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
  const [allPosts, setAllPosts] = useState<Post[]>([]); // Store all posts for statistics
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6
  });

  const { user, isLoading } = useCurrentUser();
  const itemsPerPage = 6;

  // Load initial data including all posts for statistics
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load topics and initial posts in parallel
        const [topicsResponse, postsResponse, allPostsResponse] = await Promise.all([
          topicApi.findAllPublic(),
          getPosts({ page: 1, limit: itemsPerPage }),
          getPosts({ page: 1, limit: 1000 }) // Get more posts for statistics
        ]);
        

        if (topicsResponse.success) {
          setTopics(topicsResponse.data);
        }
        
        if (postsResponse.data) {
          setFilteredPosts(postsResponse.data);
          setPagination({
            total: postsResponse.meta?.total ?? postsResponse.data.length,
            totalPages: postsResponse.meta?.totalPages ?? 1,
            currentPage: postsResponse.meta?.page ?? 1,
            limit: postsResponse.meta?.limit ?? itemsPerPage
          });
        }


        // Store all posts for statistics calculation
        if (allPostsResponse.data) {
          setAllPosts(allPostsResponse.data);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
        setPostsLoading(false);
        setTopicsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Search functionality
  useEffect(() => {
    const searchPosts = async () => {
      if (!searchTerm.trim()) {
        // If no search term, load regular posts
        try {
          setPostsLoading(true);
          const response = await getPosts({ page: 1, limit: itemsPerPage });
          
          if (response.data) {
            setFilteredPosts(response.data);
            setPagination({
              total: response.meta?.total ?? response.data.length,
              totalPages: response.meta?.totalPages ?? 1,
              currentPage: response.meta?.page ?? 1,
              limit: response.meta?.limit ?? itemsPerPage
            });

          }
        } catch (error) {
          console.error("Error loading posts:", error);
        } finally {
          setPostsLoading(false);
        }
      } else {
        // Search posts
        try {
          setPostsLoading(true);
          const response = await getPosts({ 
            search: searchTerm,
            page: 1,
            limit: itemsPerPage 
          });
          if (response.data) {
            setFilteredPosts(response.data);
              setPagination({
                total: response.meta?.total ?? response.data.length,
                totalPages: response.meta?.totalPages ?? 1,
                currentPage: response.meta?.page ?? 1,
                limit: response.meta?.limit ?? itemsPerPage
              });

          }
        } catch (error) {
          console.error("Error searching posts:", error);
          setFilteredPosts([]);
          setPagination({
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit: itemsPerPage
          });
        } finally {
          setPostsLoading(false);
        }
      }
      setCurrentPage(1);
    };

    const debounceTimer = setTimeout(searchPosts, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle pagination
  const handlePageChange = async (newPage: number) => {
    try {
      setPostsLoading(true);
      const params: QueryPostParams = { 
        page: newPage, 
        limit: itemsPerPage 
      };
      
      if (searchTerm.trim()) {
        params.search = searchTerm;
      }

      const response = await getPosts(params);
      if (response.data) {
        setFilteredPosts(response.data);
        setPagination({
          total: response.meta?.total ?? response.data.length,
          totalPages: response.meta?.totalPages ?? 1,
          currentPage: response.meta?.page ?? 1,
          limit: response.meta?.limit ?? itemsPerPage
        });

        setCurrentPage(newPage);
      }
    } catch (error) {
      console.error("Error loading page:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Get topic name by ID
  const getTopicInfo = (topicId: number): { name: string } => {
    const topic = topics.find(t => parseInt(t.id) === topicId);
    return topic ? { name: topic.name } : { name: "Unknown" };
  };

  // Calculate statistics from all posts
  const resolvedPosts = allPosts.filter(post => post.status === "solve").length;
  const unresolvedPosts = allPosts.filter(post => post.status === "problem").length;
  const totalTopics = topics.length;

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 rounded-2xl h-32 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded-lg h-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <p>Đang tải...</p>
        ) : (
          // Welcome Section 
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full border-2 border-white shadow"
                  />
                )} */}
                <div>
                  <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h2>
                  <p className="text-blue-100 text-lg">
                    Xin chào <span className="font-semibold">{user?.full_name || "Người dùng"}</span>
                  </p>
                  <p className="text-blue-200 text-sm mt-1">
                    Hãy cùng khám phá những nội dung mới nhất hôm nay
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                {user?.avatar && (
                  <div className="w-32 h-32 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Tổng bài viết" 
            value={allPosts.length} 
            icon={FileText} 
            color="blue" 
            isLoading={loading}
          />
          <StatsCard 
            title="Đã giải quyết" 
            value={resolvedPosts} 
            icon={CheckCircle} 
            color="green" 
            isLoading={loading}
          />
          <StatsCard 
            title="Chờ xử lý" 
            value={unresolvedPosts} 
            icon={Clock} 
            color="amber" 
            isLoading={loading}
          />
          <StatsCard 
            title="Chủ đề" 
            value={totalTopics} 
            icon={Tag} 
            color="purple" 
            isLoading={topicsLoading}
          />
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
              Tìm thấy <span className="font-medium text-blue-600">{pagination.total}</span> kết quả cho "{searchTerm}"
            </p>
          )}
        </div>

        {/* Topics Section */}
        {!topicsLoading && topics.length > 0 && (
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
              {displayedTopics.map((topic) => (
                <Link key={topic.id} href={`/topics/${topic.slug}`} className="block">
                  <TopicCard topic={topic} allPosts={allPosts} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {searchTerm ? `Kết quả tìm kiếm (${pagination.total})` : "Bài viết mới nhất"}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Cập nhật liên tục</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => {
                    const topicInfo = getTopicInfo(post.topic_id || 0);
                    return (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        topicName={topicInfo.name}
                      />
                    );
                  })}
                </div>
                
                {filteredPosts.length === 0 && !postsLoading && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy bài viết nào phù hợp</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !postsLoading && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}