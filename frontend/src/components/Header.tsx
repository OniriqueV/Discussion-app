// components/Header.tsx
"use client";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

interface HeaderProps {
  showLogout?: boolean;
  showSettings?: boolean;
  showAccount?: boolean;
  showUsers?: boolean; 
  showCompanies?: boolean;
  showTopics?: boolean; 
  showTags?: boolean;
  showPosts?: boolean;
  showRanking?: boolean; // New prop for ranking
}

export default function Header({
  showLogout = true,
  showSettings = true,
  showAccount = true,
  showUsers = true,
  showCompanies = true,
  showTopics = true,
  showTags = true,
  showPosts = true,
  showRanking = true, // Default to true for ranking
}: HeaderProps) {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  
  const handleNavigate = (path: string) => router.push(path);
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {/* Logo Section - Enhanced styling */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigate("/dashboard")}
              className="p-3 hover:bg-white/70 rounded-xl transition-all duration-300 hover:shadow-md group"
              title="Dashboard"
            >
              <img
                src="/Discusshark.png"
                alt="Logo"
                className="w-16 h-12 sm:w-20 sm:h-14 lg:w-24 lg:h-16 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </button>
          </div>


          {/* Navigation Section - Improved with labels */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                      {/* BXH USER */}
            {showRanking && (
              <button
                onClick={() => handleNavigate("/ranking")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title="Xếp hạng"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-yellow-500 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 21h8M12 17v4m0-4c-3.314 0-6-2.686-6-6V4h12v7c0 3.314-2.686 6-6 6zm-6-6H4a2 2 0 01-2-2V7h4m12 4h2a2 2 0 002-2V7h-4"
                  />
                </svg>

                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Xếp hạng
                </span>
              </button>
            )}
            {showSettings && (
              <button
                onClick={() => handleNavigate("/settings")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title="Settings"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Cài đặt
                </span>
              </button>
            )}

            {showAccount && (
              <button
                onClick={() => handleNavigate("/account")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title="Account"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Tài khoản
                </span>
              </button>
            )}

            {showCompanies && (
              <button
                onClick={() => handleNavigate("/companies")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title="Companies"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2zM3 7h18"
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Công ty
                </span>
              </button>
            )}

            {showUsers && (
              <button
                onClick={() => handleNavigate("/users")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title="Users"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75M12 14a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z"
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Người dùng
                </span>
              </button>
            )}

            {showTopics && (
              <button
                onClick={() => handleNavigate("/topics")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title="Topics"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2m14 0v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m0 0H19"
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Chủ đề
                </span>
              </button>
            )}

            {showTags && (
              <button
                onClick={() => handleNavigate("/tags")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title="Tags"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h10M7 12h5m-5 5h10M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z"
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Thẻ
                </span>
              </button>
            )}

            {showPosts && !userLoading && (
              <button
                onClick={() => handleNavigate(currentUser?.role === 'admin' || currentUser?.role === 'ca_user' ? "/posts" : "/posts")}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-white/70 transition-all duration-300 group hover:shadow-md min-w-[60px] sm:min-w-[70px]"
                title={currentUser?.role === 'admin' || currentUser?.role === 'ca_user' ? "Quản lý bài viết" : "Danh sách bài viết"}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h2l2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-1">
                  Bài viết
                </span>
              </button>
            )}

            {/* Logout Button - Enhanced styling */}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-3 rounded-xl hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ml-2"
              >
                <span className="hidden sm:inline">Đăng xuất</span>
                <span className="sm:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}