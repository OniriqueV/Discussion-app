// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { Post } from "@/api/postApi";
// import { getPosts, deletePost, updatePostStatus, togglePinPost } from "@/api/postApi";
// import { getCompaniesList } from "@/api/companyApi"; // Import API công ty mới
// import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
// import ConfirmModal from "./ConfirmModal";
// import { toast } from "react-toastify";
// import { useCurrentUser } from "@/hooks/useAuthRedirect";
// import { useFilterSortPaginate, SortOrder } from "@/hooks/useFilterSortPaginate";

// type SortField = "title" | "user.full_name" | "status" | "created_at";
// interface PostTableProps {
//   showDeletedOnly?: boolean;
//   readOnly?: boolean;
//   companyId?: number;
// }

// export default function PostTable({
//   showDeletedOnly = false,
//   readOnly = false,
//   companyId,
// }: PostTableProps) {
//   const router = useRouter();
//   const { user: currentUser, isLoading: userLoading } = useCurrentUser();
//   const [allPosts, setAllPosts] = useState<Post[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [confirmVisible, setConfirmVisible] = useState(false);
//   const [confirmMessage, setConfirmMessage] = useState("");
//   const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

//   // Thêm state cho company filter
//   const [companyOptions, setCompanyOptions] = useState<{id: number, name: string}[]>([]);
//   const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);

//   // Determine if user can see all companies
//   const isAdminUser = currentUser?.role === 'admin';
//   const isCaUser = currentUser?.role === 'ca_user';

//   // Use the filter/sort/paginate hook with company filtering
//   const {
//     paginatedData: posts,
//     totalPages,
//     currentPage,
//     setPage,
//     sortField,
//     setSortField,
//     sortOrder,
//     setSortOrder,
//     filteredData
//   } = useFilterSortPaginate(allPosts, DEFAULT_PAGE_SIZE, {
//     searchTerm,
//     searchFields: ["title", "user.full_name"],
//     initialSortField: "created_at",
//     initialSortOrder: "desc",
//     // Thêm custom filter cho company
//     customFilter: (post: Post) => {
//       if (selectedCompanyId) {
//         return post.company_id === selectedCompanyId;
//       }
//       return true;
//     }
//   });

//   // Lấy danh sách công ty khi component mount
//   useEffect(() => {
//     async function fetchCompanies() {
//       try {
//         // Sử dụng API mới getCompaniesList - có phân quyền tự động
//         const companies = await getCompaniesList();
//         setCompanyOptions(companies);
        
//         // Nếu không phải admin và chỉ có 1 công ty, tự động chọn
//         if (!isAdminUser && companies.length === 1) {
//           setSelectedCompanyId(companies[0].id);
//         }
//       } catch (e) {
//         console.error('Error fetching companies:', e);
//         // Không cần fallback nữa vì API mới đã handle phân quyền
//       }
//     }
    
//     if (currentUser) {
//       fetchCompanies();
//     }
//   }, [currentUser, isAdminUser]);

//   // Fetch all posts from API (without pagination since we handle it frontend)
//   const fetchPosts = async () => {
//     try {
//       setLoading(true);
//       const params: any = {
//         page: 1,
//         limit: 1000, // Fetch more posts to handle frontend pagination
//         include_deleted: showDeletedOnly ? true : undefined,
//         company_id: companyId || undefined,
//       };

//       const response = await getPosts(params);
//       setAllPosts(response.data || []);
//     } catch (error) {
//       console.error("Error fetching posts:", error);
//       toast.error("Lỗi khi tải danh sách bài viết");
//       setAllPosts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Check authentication
//   useEffect(() => {
//     if (!userLoading && !currentUser) {
//       toast.error("Vui lòng đăng nhập để xem danh sách bài viết");
//       router.push("/login");
//       return;
//     }
//   }, [currentUser, userLoading, router]);

//   // Load posts on component mount
//   useEffect(() => {
//     if (!userLoading && currentUser) {
//       fetchPosts();
//     }
//   }, [currentUser, userLoading, showDeletedOnly, companyId]);

//   // Reset to first page when search term or company filter changes
//   useEffect(() => {
//     setPage(0);
//   }, [searchTerm, selectedCompanyId, setPage]);

//   const handleSort = (field: string) => {
//     const sortKey = field as keyof Post;
//     if (sortField === sortKey) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(sortKey);
//       setSortOrder("asc");
//     }
//   };

//   const getSortIcon = (field: string) => {
//     const sortKey = field as keyof Post;
//     if (sortField !== sortKey) return "↕️";
//     return sortOrder === "asc" ? "↑" : "↓";
//   };

//   const toggleSelect = (id: string) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     const currentIds = posts.map((p) => p.id.toString());
//     const allSelected = currentIds.every((id) => selectedIds.includes(id));
//     if (allSelected) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(currentIds);
//     }
//   };

//   const showConfirm = (message: string, action: () => void) => {
//     setConfirmMessage(message);
//     setOnConfirmAction(() => action);
//     setConfirmVisible(true);
//   };

//   const handleDelete = async (id: number) => {
//     showConfirm("Bạn có chắc muốn xoá bài viết này?", async () => {
//       try {
//         await deletePost(id);
//         toast.success(MESSAGES.SUCCESS_DELETE_POST || "Xoá bài viết thành công");
//         setSelectedIds((prev) => prev.filter((x) => x !== id.toString()));
//         fetchPosts(); // Refresh the list
//       } catch (error) {
//         console.error("Error deleting post:", error);
//         toast.error("Lỗi khi xoá bài viết");
//       }
//     });
//   };

//   const handleBulkDelete = () => {
//     if (selectedIds.length === 0) {
//       toast.warn(MESSAGES.WARNING_SELECT_USERS || "Chọn bài viết để xoá");
//       return;
//     }
//     showConfirm(`Xoá ${selectedIds.length} bài viết đã chọn?`, async () => {
//       try {
//         await Promise.all(selectedIds.map(id => deletePost(parseInt(id))));
//         setSelectedIds([]);
//         toast.success(MESSAGES.SUCCESS_BULK_DELETE_POST || "Xoá hàng loạt thành công");
//         fetchPosts(); // Refresh the list
//       } catch (error) {
//         console.error("Error bulk deleting posts:", error);
//         toast.error("Lỗi khi xoá hàng loạt");
//       }
//     });
//   };

//   const handleTogglePin = async (id: number) => {
//     try {
//       await togglePinPost(id);
//       toast.success("Cập nhật trạng thái ghim thành công");
//       fetchPosts(); // Refresh the list
//     } catch (error) {
//       console.error("Error toggling pin:", error);
//       toast.error("Lỗi khi cập nhật trạng thái ghim");
//     }
//   };

//   const handleStatusChange = async (id: number, status: string) => {
//     try {
//       await updatePostStatus(id, status);
//       toast.success("Cập nhật trạng thái thành công");
//       fetchPosts(); // Refresh the list
//     } catch (error) {
//       console.error("Error updating status:", error);
//       toast.error("Lỗi khi cập nhật trạng thái");
//     }
//   };

//   // Permission check functions
//   const canEdit = (post: Post) => {
//     return currentUser?.id === post.user_id;
//   };

//   const canDelete = (post: Post) => {
//     return currentUser?.role === 'admin' || 
//            (currentUser?.role === 'ca_user' && currentUser?.company_id === post.company_id);
//   };

//   const canPin = () => {
//     return currentUser?.role === 'admin' || currentUser?.role === 'ca_user';
//   };

//   const canChangeStatus = () => {
//     return currentUser?.role === 'admin' || currentUser?.role === 'ca_user';
//   };

//   const handleAdd = () => router.push("/posts/add");
//   const handleEdit = (id: number) => router.push(`/posts/edit/${id}`);
//   const handleView = (id: number) => router.push(`/posts/detail/${id}`);

//   const getStatusDisplay = (status: string) => {
//     const statusMap: { [key: string]: string } = {
//       'not_resolved': 'Chưa giải quyết',
//       'resolved': 'Đã giải quyết',
//       'deleted_by_admin': 'Xóa bởi Admin',
//       'deleted_by_company': 'Xóa bởi Công ty'
//     };
//     return statusMap[status] || status;
//   };

//   const getStatusColor = (status: string) => {
//     const colorMap: { [key: string]: string } = {
//       'not_resolved': 'bg-red-100 text-red-800',
//       'resolved': 'bg-green-100 text-green-800',
//       'deleted_by_admin': 'bg-gray-100 text-gray-800',
//       'deleted_by_company': 'bg-yellow-100 text-yellow-800'
//     };
//     return colorMap[status] || 'bg-gray-100 text-gray-800';
//   };

//   // Helper function to get nested property value for sorting
//   const getNestedValue = (obj: any, path: string) => {
//     return path.split('.').reduce((current, key) => current?.[key], obj);
//   };

//   // Show loading while checking authentication
//   if (userLoading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2">Đang kiểm tra quyền truy cập...</span>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <div className="text-center">
//           <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem danh sách bài viết</p>
//           <button
//             onClick={() => router.push("/login")}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Đăng nhập
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2">Đang tải...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <p className="text-sm text-gray-600">
//             Xin chào, {currentUser.full_name} ({currentUser.role})
//           </p>
//         </div>
//         <div className="flex gap-2 flex-wrap">
//           {/* Company Filter - chỉ hiển thị nếu có options */}
//           {companyOptions.length > 0 && (
//             <select
//               value={selectedCompanyId ?? ""}
//               onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : undefined)}
//               className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               disabled={!isAdminUser} // Disable for non-admin users
//             >
//               {isAdminUser && <option value="">Tất cả công ty</option>}
//               {companyOptions.map(c => (
//                 <option key={c.id} value={c.id}>{c.name}</option>
//               ))}
//             </select>
//           )}
          
//           <input
//             type="text"
//             placeholder="Tìm theo tiêu đề, tác giả..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="px-3 py-2 border rounded-md"
//           />
          
//           {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
//             <button
//               onClick={() => router.push("/posts/deleted")}
//               className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//             >
//               Bài viết đã xoá
//             </button>
//           )}
//           <button
//             onClick={() => router.push("/posts/mypost")}
//             className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
//           >
//             Bài viết của tôi
//           </button>
//           <button
//             onClick={handleAdd}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Thêm bài viết
//           </button>
//           {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
//             <button
//               onClick={handleBulkDelete}
//               disabled={selectedIds.length === 0}
//               className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//             >
//               Xoá đã chọn ({selectedIds.length})
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="text-sm text-gray-600">
//         Hiển thị {posts.length} / {filteredData.length} bài viết
//         {searchTerm && ` (từ ${allPosts.length} tổng cộng)`}
//         {selectedCompanyId && ` - Công ty: ${companyOptions.find(c => c.id === selectedCompanyId)?.name}`}
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full border text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-3 py-2 border-b text-left">
//                 {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
//                   <input
//                     type="checkbox"
//                     checked={posts.length > 0 && posts.every((p) => selectedIds.includes(p.id.toString()))}
//                     onChange={toggleSelectAll}
//                   />
//                 )}
//               </th>
//               <th
//                 className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
//                 onClick={() => handleSort("title")}
//               >
//                 Tiêu đề {getSortIcon("title")}
//               </th>
//               <th
//                 className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
//                 onClick={() => handleSort("user.full_name")}
//               >
//                 Tác giả {getSortIcon("user.full_name")}
//               </th>
//               <th className="px-3 py-2 border-b text-left">Công ty</th>
//               <th className="px-3 py-2 border-b text-left">Chủ đề</th>
//               <th
//                 className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
//                 onClick={() => handleSort("status")}
//               >
//                 Trạng thái {getSortIcon("status")}
//               </th>
//               <th className="px-3 py-2 border-b text-left">Tags</th>
//               <th className="px-3 py-2 border-b text-left">Lượt xem</th>
//               <th
//                 className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
//                 onClick={() => handleSort("created_at")}
//               >
//                 Ngày tạo {getSortIcon("created_at")}
//               </th>
//               {!readOnly && (
//                 <th className="px-3 py-2 border-b">Thao tác</th>
//               )}
//             </tr>
//           </thead>
//           <tbody>
//             {posts.length === 0 ? (
//               <tr>
//                 <td colSpan={currentUser?.role === 'admin' || currentUser?.role === 'ca_user' ? 10 : 9} className="text-center py-6 text-gray-500">
//                   {searchTerm || selectedCompanyId ? "Không tìm thấy bài viết nào" : "Không có bài viết nào"}
//                 </td>
//               </tr>
//             ) : (
//               posts.map((post) => (
//                 <tr key={post.id} className="hover:bg-gray-50">
//                   <td className="px-3 py-2 border-b">
//                     {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
//                       <input
//                         type="checkbox"
//                         checked={selectedIds.includes(post.id.toString())}
//                         onChange={() => toggleSelect(post.id.toString())}
//                       />
//                     )}
//                   </td>
//                   <td className="px-3 py-2 border-b">
//                     <div className="flex items-center gap-2">
//                       {post.is_pinned && (
//                         <span className="text-blue-600 text-xs">📌</span>
//                       )}
//                       <span className="font-medium">{post.title}</span>
//                     </div>
//                   </td>
//                   <td className="px-3 py-2 border-b">
//                     {post.user?.full_name || 'N/A'}
//                   </td>
//                   <td className="px-3 py-2 border-b text-gray-600">
//                     {post.company?.name || 'N/A'}
//                   </td>
//                   <td className="px-3 py-2 border-b">
//                     {post.topic?.name || 'N/A'}
//                   </td>
//                   <td className="px-3 py-2 border-b">
//                     <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(post.status)}`}>
//                       {getStatusDisplay(post.status)}
//                     </span>
//                   </td>
//                   <td className="px-3 py-2 border-b">
//                     {post.tags?.map(tag => tag.name).join(", ") || 'N/A'}
//                   </td>
//                   <td className="px-3 py-2 border-b">{post.views}</td>
//                   <td className="px-3 py-2 border-b">
//                     {new Date(post.created_at).toLocaleDateString('vi-VN')}
//                   </td>
//                   {!readOnly && (
//                     <td className="px-3 py-2 border-b">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleView(post.id)}
//                           className="text-green-600 hover:text-green-800 text-sm"
//                         >
//                           Xem
//                         </button>
//                         {canEdit(post) && (
//                           <button
//                             onClick={() => handleEdit(post.id)}
//                             className="text-blue-600 hover:text-blue-800 text-sm"
//                           >
//                             Sửa
//                           </button>
//                         )}
//                         {canPin() && (
//                           <button
//                             onClick={() => handleTogglePin(post.id)}
//                             className="text-purple-600 hover:text-purple-800 text-sm"
//                           >
//                             {post.is_pinned ? 'Bỏ ghim' : 'Ghim'}
//                           </button>
//                         )}
//                         {canDelete(post) && (
//                           <button
//                             onClick={() => handleDelete(post.id)}
//                             className="text-red-600 hover:text-red-800 text-sm"
//                           >
//                             Xoá
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   )}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="flex justify-between items-center mt-4">
//           <div className="text-sm text-gray-600">
//             Trang {currentPage + 1} / {totalPages}
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setPage(Math.max(0, currentPage - 1))}
//               disabled={currentPage === 0}
//               className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
//             >
//               Trước
//             </button>
//             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//               const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
//               return (
//                 <button
//                   key={pageNum}
//                   onClick={() => setPage(pageNum)}
//                   className={`px-3 py-1 border rounded ${
//                     pageNum === currentPage ? "bg-blue-600 text-white" : "hover:bg-gray-50"
//                   }`}
//                 >
//                   {pageNum + 1}
//                 </button>
//               );
//             })}
//             <button
//               onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
//               disabled={currentPage === totalPages - 1}
//               className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
//             >
//               Sau
//             </button>
//           </div>
//         </div>
//       )}

//       {confirmVisible && (
//         <ConfirmModal
//           message={confirmMessage}
//           onConfirm={() => {
//             onConfirmAction();
//             setConfirmVisible(false);
//           }}
//           onCancel={() => setConfirmVisible(false)}
//         />
//       )}
//     </div>
//   );
// }


//Bên trên fix cứng chỉ hiển thị với bài viết của công ty hiện tại - userId

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/api/postApi";
import { getPosts, deletePost, updatePostStatus, togglePinPost } from "@/api/postApi";
import { getCompaniesList } from "@/api/companyApi";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import ConfirmModal from "./ConfirmModal";
import { toast } from "react-toastify";
import { useCurrentUser } from "@/hooks/useAuthRedirect";
import { useFilterSortPaginate, SortOrder } from "@/hooks/useFilterSortPaginate";

type SortField = "title" | "user.full_name" | "status" | "created_at";
interface PostTableProps {
  showDeletedOnly?: boolean;
  readOnly?: boolean;
  companyId?: number;
}

export default function PostTable({
  showDeletedOnly = false,
  readOnly = false,
  companyId,
}: PostTableProps) {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  // Company filter state
  const [companyOptions, setCompanyOptions] = useState<{id: number, name: string}[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);

  // Determine if user can see all companies
  const isAdminUser = currentUser?.role === 'admin';
  const isCaUser = currentUser?.role === 'ca_user';

  // Use the filter/sort/paginate hook with company filtering
  const {
    paginatedData: posts,
    totalPages,
    currentPage,
    setPage,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filteredData
  } = useFilterSortPaginate(allPosts, DEFAULT_PAGE_SIZE, {
    searchTerm,
    searchFields: ["title", "user.full_name"],
    initialSortField: "created_at",
    initialSortOrder: "desc",
    customFilter: (post: Post) => {
      if (!selectedCompanyId) {
        return true;
      }
      return post.company_id === selectedCompanyId;
    }
  });

  // Fetch companies list
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const companies = await getCompaniesList();
        setCompanyOptions(companies);
        
        if (!isAdminUser && companies.length === 1) {
          // setSelectedCompanyId(companies[0].id);
        }
      } catch (e) {
        console.error('Error fetching companies:', e);
      }
    }
    
    if (currentUser) {
      fetchCompanies();
    }
  }, [currentUser, isAdminUser]);

  // Fetch all posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 1000,
        include_deleted: showDeletedOnly ? true : undefined,
        company_id: companyId || undefined,
      };

      const response = await getPosts(params);
      setAllPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Lỗi khi tải danh sách bài viết");
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Vui lòng đăng nhập để xem danh sách bài viết");
      router.push("/login");
      return;
    }
  }, [currentUser, userLoading, router]);

  // Load posts on component mount
  useEffect(() => {
    if (!userLoading && currentUser) {
      fetchPosts();
    }
  }, [currentUser, userLoading, showDeletedOnly, companyId]);

  // Reset to first page when search term or company filter changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedCompanyId, setPage]);

  const handleSort = (field: string) => {
    const sortKey = field as keyof Post;
    if (sortField === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(sortKey);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    const sortKey = field as keyof Post;
    if (sortField !== sortKey) return (
      <svg className="w-4 h-4 text-gray-400 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
    return sortOrder === "asc" ? (
      <svg className="w-4 h-4 text-blue-600 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = posts.map((p) => p.id.toString());
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentIds);
    }
  };

  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmVisible(true);
  };

  const handleDelete = async (id: number) => {
    showConfirm("Bạn có chắc muốn xoá bài viết này?", async () => {
      try {
        await deletePost(id);
        toast.success(MESSAGES.SUCCESS_DELETE_POST || "Xoá bài viết thành công");
        setSelectedIds((prev) => prev.filter((x) => x !== id.toString()));
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Lỗi khi xoá bài viết");
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn(MESSAGES.WARNING_SELECT_USERS || "Chọn bài viết để xoá");
      return;
    }
    showConfirm(`Xoá ${selectedIds.length} bài viết đã chọn?`, async () => {
      try {
        await Promise.all(selectedIds.map(id => deletePost(parseInt(id))));
        setSelectedIds([]);
        toast.success(MESSAGES.SUCCESS_BULK_DELETE_POST || "Xoá hàng loạt thành công");
        fetchPosts();
      } catch (error) {
        console.error("Error bulk deleting posts:", error);
        toast.error("Lỗi khi xoá hàng loạt");
      }
    });
  };

  const handleTogglePin = async (id: number) => {
    try {
      await togglePinPost(id);
      toast.success("Cập nhật trạng thái ghim thành công");
      fetchPosts();
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Lỗi khi cập nhật trạng thái ghim");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updatePostStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchPosts();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Permission check functions
  const canEdit = (post: Post) => {
    return currentUser?.id === post.user_id;
  };

  const canDelete = (post: Post) => {
    return currentUser?.role === 'admin' || 
           (currentUser?.role === 'ca_user' && currentUser?.company_id === post.company_id);
  };

  const canPin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'ca_user';
  };

  const canChangeStatus = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'ca_user';
  };

  const handleAdd = () => router.push("/posts/add");
  const handleEdit = (id: number) => router.push(`/posts/edit/${id}`);
  const handleView = (id: number) => router.push(`/posts/detail/${id}`);

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'not_resolved': 'Chưa giải quyết',
      'resolved': 'Đã giải quyết',
      'deleted_by_admin': 'Xóa bởi Admin',
      'deleted_by_company': 'Xóa bởi Công ty'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'not_resolved': 'bg-red-50 text-red-700 border border-red-200',
      'resolved': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      'deleted_by_admin': 'bg-gray-50 text-gray-700 border border-gray-200',
      'deleted_by_company': 'bg-amber-50 text-amber-700 border border-amber-200'
    };
    return colorMap[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  // Helper function to get nested property value for sorting
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-gray-600 animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem danh sách bài viết</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-gray-600 animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quản lý bài viết</h2>
              <p className="text-sm text-gray-600">
                Xin chào, <span className="font-medium">{currentUser.full_name}</span> 
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {currentUser.role}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/posts/mypost")}
              className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition duration-200 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Bài viết của tôi
            </button>
            
            {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
              <button
                onClick={() => router.push("/posts/deleted")}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Bài viết đã xoá
              </button>
            )}
            
            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm bài viết
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Company Filter */}
            {companyOptions.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCompanyId ?? ""}
                  onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : undefined)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="">🏢 Tất cả công ty</option>
                  {companyOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="relative flex-1 lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="🔍 Tìm theo tiêu đề, tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xoá đã chọn ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Hiển thị <span className="font-medium">{posts.length}</span> / <span className="font-medium">{filteredData.length}</span> bài viết
            {searchTerm && (
              <span className="text-blue-600"> 
                {" "}(từ {allPosts.length} tổng cộng)
              </span>
            )}
            {selectedCompanyId && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {companyOptions.find(c => c.id === selectedCompanyId)?.name}
              </span>
            )}
          </div>
          {selectedIds.length > 0 && (
            <div className="text-blue-600 font-medium">
              Đã chọn: {selectedIds.length} bài viết
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
                    <input
                      type="checkbox"
                      checked={posts.length > 0 && posts.every((p) => selectedIds.includes(p.id.toString()))}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                </th>
                <th
                  className="px-6 py-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                    Tiêu đề
                    {getSortIcon("title")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("user.full_name")}
                >
                  <div className="flex items-center">
                    Tác giả
                    {getSortIcon("user.full_name")}
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-900">Công ty</th>
                <th className="px-6 py-4 text-left font-medium text-gray-900">Chủ đề</th>
                <th
                  className="px-6 py-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {getSortIcon("status")}
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-medium text-gray-900">Tags</th>
                <th className="px-6 py-4 text-left font-medium text-gray-900">Lượt xem</th>
                <th
                  className="px-6 py-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    Ngày tạo
                    {getSortIcon("created_at")}
                  </div>
                </th>
                {!readOnly && (
                  <th className="px-6 py-4 text-center font-medium text-gray-900">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={currentUser?.role === 'admin' || currentUser?.role === 'ca_user' ? 10 : 9} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {searchTerm || selectedCompanyId ? "Không tìm thấy bài viết nào" : "Chưa có bài viết nào"}
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm || selectedCompanyId ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" : "Hãy tạo bài viết đầu tiên của bạn"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(post.id.toString())}
                          onChange={() => toggleSelect(post.id.toString())}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {post.is_pinned && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📌 Ghim
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 cursor-pointer" 
                             onClick={() => handleView(post.id)}>
                            {post.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                          {post.user?.full_name?.charAt(0)?.toUpperCase() || 'N'}
                        </div>
                        <span className="text-sm text-gray-900">{post.user?.full_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        🏢 {post.company?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        📂 {post.topic?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {getStatusDisplay(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                              >
                                #{tag.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">Không có tag</span>
                          )}

                          {post.tags && post.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>

                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm text-gray-900">{post.views}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(post.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    {!readOnly && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleView(post.id)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit Button */}
                          {canEdit(post) && (
                            <button
                              onClick={() => handleEdit(post.id)}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {/* Pin Button */}
                          {canPin() && (
                            <button
                              onClick={() => handleTogglePin(post.id)}
                              className={`inline-flex items-center p-2 rounded-lg transition-colors ${
                                post.is_pinned 
                                  ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' 
                                  : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                              }`}
                              title={post.is_pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                            >
                              <svg className="w-4 h-4" fill={post.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete(post) && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa bài viết"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Trang <span className="font-medium">{currentPage + 1}</span> của <span className="font-medium">{totalPages}</span>
              <span className="hidden sm:inline text-gray-500 ml-2">
                ({posts.length} bài viết hiện tại)
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => setPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Sau
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmVisible && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={() => {
            onConfirmAction();
            setConfirmVisible(false);
          }}
          onCancel={() => setConfirmVisible(false)}
        />
      )}
    </div>
  );
}