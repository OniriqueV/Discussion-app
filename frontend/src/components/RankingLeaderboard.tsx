import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, Calendar, Building2, ChevronLeft, ChevronRight, Crown, Star } from 'lucide-react';
import { rankingService } from '@/api/ranking';
import type { RankingResponse, UserRank } from '@/api/ranking';

export default function RankingLeaderboard() {
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [myRank, setMyRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(false);
  const [myRankLoading, setMyRankLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'total' | 'weekly' | 'monthly' | 'yearly'>('total');
  const [currentPage, setCurrentPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState('');

  const periods = [
    { value: 'total' as const, label: 'Tổng cộng', icon: Trophy },
    { value: 'yearly' as const, label: 'Năm nay', icon: Calendar },
    { value: 'monthly' as const, label: 'Tháng này', icon: Calendar },
    { value: 'weekly' as const, label: 'Tuần này', icon: Calendar }
  ];

  useEffect(() => {
    fetchRankings();
  }, [period, currentPage, companyFilter]);

  useEffect(() => {
    fetchMyRank();
  }, [period]);

  const fetchRankings = async () => {
  setLoading(true);
  setError(null);
  try {
    const parsedCompanyId = parseInt(companyFilter);
    console.log('Sending company_id:', companyFilter, parsedCompanyId);
    
    const response = await rankingService.getRanking({
      period: period,
      page: currentPage,
      limit: 10,
      company_id:
  companyFilter.trim() !== '' && !isNaN(Number(companyFilter)) && Number(companyFilter) > 0
    ? Number(companyFilter)
    : undefined,

    });
    setRankings(response);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    setError('Không thể tải bảng xếp hạng. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};


  const fetchMyRank = async () => {
    setMyRankLoading(true);
    try {
      const response = await rankingService.getMyRank(period);
      setMyRank(response);
    } catch (error) {
      console.error('Error fetching my rank:', error);
      // Don't show error for my rank as it's not critical
    } finally {
      setMyRankLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-semibold">
            #{rank}
          </span>
        );
    }
  };

  const getRankBadgeColor = (rank: number | null): string => {
    if (!rank) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    }
  };

  const formatPoints = (points: number): string => {
    return points.toLocaleString('vi-VN');
  };

  const handlePeriodChange = (newPeriod: 'total' | 'weekly' | 'monthly' | 'yearly') => {
    setPeriod(newPeriod);
    setCurrentPage(1); // Reset to first page when changing period
  };

  const handleCompanyFilterChange = (value: string) => {
    
    setCompanyFilter(value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  

  const totalPages = rankings?.pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Bảng Xếp Hạng</h1>
          </div>
          <p className="text-gray-600 text-lg">Theo dõi thành tích của bạn và cạnh tranh với những người dùng hàng đầu</p>
        </div>

        {/* My Rank Card */}
        {myRank && (
          <div className="mb-8">
            <div className={`rounded-2xl p-6 ${getRankBadgeColor(myRank.rank)} transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    {myRankLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    ) : (
                      <Users className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Thứ hạng của bạn</h3>
                    <p className="text-white text-opacity-90">{myRank.company_name || 'Chưa có công ty'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    {myRank.rank && getRankIcon(myRank.rank)}
                    <span className="text-2xl font-bold text-white">
                      {myRank.rank ? `#${myRank.rank}` : 'Chưa xếp hạng'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-white" />
                    <span className="text-xl font-semibold text-white">{formatPoints(myRank.points)} điểm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Period Filter */}
            <div className="flex flex-wrap gap-2">
              {periods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handlePeriodChange(value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    period === value
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Company Filter */}
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <input
                type="number"
                placeholder="ID công ty..."
                value={companyFilter}
                onChange={(e) => handleCompanyFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-red-500">⚠️</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchRankings}
                className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Top Performers - {periods.find(p => p.value === period)?.label}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Đang tải bảng xếp hạng...</span>
            </div>
          ) : rankings?.data && rankings.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hạng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Người dùng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Công ty</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Điểm số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rankings.data.map((user) => (
                    <tr key={user.user_id} className={`hover:bg-gray-50 transition-colors duration-200 ${
                      user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(user.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{user.company_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold text-gray-900">{formatPoints(user.points)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loading && (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không có dữ liệu xếp hạng</p>
            </div>
          )}

          {/* Pagination */}
          {rankings?.pagination && rankings.pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{((currentPage - 1) * (rankings.pagination.limit || 10)) + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(currentPage * (rankings.pagination.limit || 10), rankings.pagination.total)}</span> trong tổng số{' '}
                  <span className="font-medium">{rankings.pagination.total}</span> kết quả
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return pageNum <= totalPages ? (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ) : null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}