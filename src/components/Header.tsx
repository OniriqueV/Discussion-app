// components/Header.tsx
"use client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  showLogout?: boolean;
  showSettings?: boolean;
  showAccount?: boolean;
  showUsers?: boolean; 
  showCompanies?: boolean;
  showTopics?: boolean; 
  showTags?: boolean;
}

export default function Header({
  showLogout = true,
  showSettings = true,
  showAccount = true,
  showUsers = true,
  showCompanies = true,
  showTopics = true,
  showTags = true,
}: HeaderProps) {
  const router = useRouter();
  
  const handleNavigate = (path: string) => router.push(path);
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo Section - Responsive sizing */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigate("/dashboard")}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              title="Dashboard"
            >
              <img
                src="/Discusshark.png"
                alt="Logo"
                className="w-16 h-12 sm:w-20 sm:h-14 lg:w-24 lg:h-16 object-contain"
              />
            </button>
          </div>

          {/* Actions Section - Better spacing and responsive design */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {showSettings && (
              <button
                onClick={() => handleNavigate("/settings")}
                className="p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                title="Settings"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors" 
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
              </button>
            )}

            {showAccount && (
              <button
                onClick={() => handleNavigate("/account")}
                className="p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                title="Account"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors" 
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
              </button>
            )}
            {showCompanies && (
            <button
              onClick={() => handleNavigate("/companies")}
              className="p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              title="Companies"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors"
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
            </button>
          )}


            {showUsers && (
                <button
                    onClick={() => handleNavigate("/users")}
                    className="p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                    title="Users"
                >
                    <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a4 4 0 00-3-3.87M9 
                        20H4v-2a4 4 0 013-3.87M16 
                        3.13a4 4 0 010 7.75M8 
                        3.13a4 4 0 000 7.75M12 
                        14a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z"
                    />
                    </svg>
                </button>
                )}

            {showTopics && (
              <button
                onClick={() => handleNavigate("/topics")}
                className="p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                title="Topics"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors"
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
              </button>
            )}

            {showTags && (
            <button
              onClick={() => handleNavigate("/tags")}
              className="p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              title="Tags"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors"
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
            </button>
          )}



            {showLogout && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-md hover:bg-red-600 active:bg-red-700 transition-colors duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
              >
                <span className="hidden sm:inline">Logout</span>
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