import React, { useState, useEffect } from 'react';
import { Users, Trophy, Tag, TrendingUp, Eye, Calendar, ChevronRight } from 'lucide-react';

// Types
interface UserRanking {
  user_id: number;
  full_name: string;
  email: string;
  company_name: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  yearly_points: number;
  rank: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  created_at: string;
}

// Mock API functions (you'll replace these with actual API calls)
const mockUserService = {
  async getTopUsers(limit = 10, period = 'total'): Promise<UserRanking[]> {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        const mockUsers: UserRanking[] = [
          {
            user_id: 1,
            full_name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            company_name: 'Công ty ABC',
            total_points: 1250,
            weekly_points: 45,
            monthly_points: 180,
            yearly_points: 1250,
            rank: 1
          },
          {
            user_id: 2,
            full_name: 'Trần Thị B',
            email: 'tranthib@example.com',
            company_name: 'Công ty XYZ',
            total_points: 1100,
            weekly_points: 38,
            monthly_points: 160,
            yearly_points: 1100,
            rank: 2
          },
          {
            user_id: 3,
            full_name: 'Lê Minh C',
            email: 'leminhc@example.com',
            company_name: 'Công ty DEF',
            total_points: 950,
            weekly_points: 42,
            monthly_points: 140,
            yearly_points: 950,
            rank: 3
          },
          {
            user_id: 4,
            full_name: 'Phạm Thu D',
            email: 'phamthud@example.com',
            company_name: 'Công ty GHI',
            total_points: 800,
            weekly_points: 30,
            monthly_points: 120,
            yearly_points: 800,
            rank: 4
          },
          {
            user_id: 5,
            full_name: 'Hoàng Văn E',
            email: 'hoangvane@example.com',
            company_name: 'Công ty JKL',
            total_points: 750,
            weekly_points: 25,
            monthly_points: 100,
            yearly_points: 750,
            rank: 5
          }
        ];
        resolve(mockUsers);
      }, 500);
    });
  }
};

const mockTagApi = {
  async getPopular(limit = 10): Promise<Tag[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockTags: Tag[] = [
          { id: '1', name: 'React', slug: 'react', postCount: 156, created_at: '2024-01-15' },
          { id: '2', name: 'JavaScript', slug: 'javascript', postCount: 142, created_at: '2024-01-10' },
          { id: '3', name: 'TypeScript', slug: 'typescript', postCount: 98, created_at: '2024-01-20' },
          { id: '4', name: 'Node.js', slug: 'nodejs', postCount: 87, created_at: '2024-01-25' },
          { id: '5', name: 'Next.js', slug: 'nextjs', postCount: 76, created_at: '2024-02-01' },
          { id: '6', name: 'Prisma', slug: 'prisma', postCount: 65, created_at: '2024-02-05' },
          { id: '7', name: 'PostgreSQL', slug: 'postgresql', postCount: 54, created_at: '2024-02-10' },
          { id: '8', name: 'Tailwind CSS', slug: 'tailwind-css', postCount: 43, created_at: '2024-02-15' }
        ];
        resolve(mockTags);
      }, 300);
    });
  }
};

// User Leaderboard Component
const UserLeaderboard: React.FC = () => {
  const [users, setUsers] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'total' | 'yearly' | 'monthly' | 'weekly'>('total');

  useEffect(() => {
    const fetchTopUsers = async () => {
      setLoading(true);
      try {
        const data = await mockUserService.getTopUsers(10, period);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching top users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, [period]);

  const getPeriodPoints = (user: UserRanking) => {
    switch (period) {
      case 'weekly': return user.weekly_points;
      case 'monthly': return user.monthly_points;
      case 'yearly': return user.yearly_points;
      default: return user.total_points;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-600">#{rank}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Bảng Xếp Hạng</h2>
          </div>
        </div>
        
        <div className="flex gap-1">
          {[
            { key: 'total', label: 'Tổng' },
            { key: 'yearly', label: 'Năm' },
            { key: 'monthly', label: 'Tháng' },
            { key: 'weekly', label: 'Tuần' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.user_id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 truncate">{user.company_name}</p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {getPeriodPoints(user).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">điểm</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả
          </button>
        </div>
      </div>
    </div>
  );
};

// Tags Table Component
const TagsTable: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const data = await mockTagApi.getPopular(8);
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagClick = (slug: string) => {
    // Navigate to tag detail page
    console.log('Navigate to tag:', slug);
    // In real app: router.push(`/tags/${slug}`) or similar
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tags Phổ Biến</h2>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => handleTagClick(tag.slug)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Tag className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {tag.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {tag.postCount} bài viết
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {tag.postCount}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả tags
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Dashboard Layout
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Tổng quan hoạt động của cộng đồng</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <UserLeaderboard />
          <TagsTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// // Trong UserLeaderboard component, thay:
// const data = await mockUserService.getTopUsers(10, period);
// // Bằng:
// const data = await userService.getTopUsers({ limit: 10, period });

// // Trong TagsTable component, thay:
// const data = await mockTagApi.getPopular(8);
// // Bằng:  
// const response = await tagApi.getPopular(8);
// const data = response.data;