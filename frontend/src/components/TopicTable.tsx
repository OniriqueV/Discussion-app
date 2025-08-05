"use client";
import { Topic, topicApi } from "@/api/topic";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

type SortKey = "name" | "postCount" | "created_at";

export default function TopicTable() {
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [data, setData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  // Check authentication and permissions
  useEffect(() => {
    if (!userLoading && (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user'))) {
      toast.error("Bạn không có quyền truy cập trang này");
      return;
    }
  }, [currentUser, userLoading]);

  // Load data from API
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'ca_user')) {
      loadTopics();
    }
  }, [currentUser]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await topicApi.findAll();
      if (response.success) {
        setData(response.data);
      } else {
        toast.error("Không thể tải danh sách topics");
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách topics");
      console.error("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSorted = useMemo(() => {
    let filtered = data.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortKey) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "postCount":
          aVal = a._count?.posts || 0;
          bVal = b._count?.posts || 0;
          break;
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        default:
          aVal = a.created_at;
          bVal = b.created_at;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, search, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredSorted.length / DEFAULT_PAGE_SIZE);
  const paginatedTopics = filteredSorted.slice(
    page * DEFAULT_PAGE_SIZE,
    (page + 1) * DEFAULT_PAGE_SIZE
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const toggleSelect = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
    );
  };

  const toggleSelectAll = () => {
    const currentSlugs = paginatedTopics.map((t) => t.slug);
    const allSelected = currentSlugs.every((slug) => selectedSlugs.includes(slug));

    if (allSelected) {
      setSelectedSlugs((prev) => prev.filter((slug) => !currentSlugs.includes(slug)));
    } else {
      setSelectedSlugs((prev) => [...new Set([...prev, ...currentSlugs])]);
    }
  };

  const handleDelete = (topic: Topic) => {
    setConfirmMessage(`Bạn có chắc muốn xoá topic "${topic.name}"?`);
    setOnConfirmAction(() => async () => {
      try {
        const response = await topicApi.delete(topic.slug);
        if (response.success) {
          setData((prev) => prev.filter((t) => t.slug !== topic.slug));
          setSelectedSlugs((prev) => prev.filter((slug) => slug !== topic.slug));
          toast.success(MESSAGES.SUCCESS_DELETE_TOPIC || "Xóa topic thành công");
        }
      } catch (error) {
        toast.error("Lỗi khi xóa topic");
        console.error("Error deleting topic:", error);
      }
    });
    setConfirmVisible(true);
  };

  const handleBulkDelete = () => {
    if (selectedSlugs.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một topic để xoá.");
      return;
    }

    setConfirmMessage(`Bạn có chắc muốn xoá ${selectedSlugs.length} topic đã chọn?`);
    setOnConfirmAction(() => async () => {
      try {
        const response = await topicApi.bulkDelete({ slugs: selectedSlugs });
        if (response.success) {
          setData((prev) => prev.filter((t) => !selectedSlugs.includes(t.slug)));
          setSelectedSlugs([]);
          toast.success(MESSAGES.SUCCESS_BULK_DELETE_TOPIC || "Xóa topics thành công");
        }
      } catch (error) {
        toast.error("Lỗi khi xóa topics");
        console.error("Error bulk deleting topics:", error);
      }
    });
    setConfirmVisible(true);
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Check permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user')) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Check permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user')) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Check permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user')) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Check permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user')) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Check permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user')) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Check permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user')) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Check permissions
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'ca_user')) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên topic..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="border p-2 w-full md:w-1/3 rounded"
        />
        <button
          onClick={handleBulkDelete}
          disabled={selectedSlugs.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Xoá đã chọn ({selectedSlugs.length})
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">
              <input
                type="checkbox"
                checked={
                  paginatedTopics.length > 0 &&
                  paginatedTopics.every((t) => selectedSlugs.includes(t.slug))
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => toggleSort("name")}>
              Tên Topic {getSortIcon("name")}
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => toggleSort("postCount")}>
              Số bài viết {getSortIcon("postCount")}
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => toggleSort("created_at")}>
              Ngày tạo {getSortIcon("created_at")}
            </th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTopics.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                Không có topic nào
              </td>
            </tr>
          ) : (
            paginatedTopics.map((topic) => (
              <tr key={topic.id}>
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectedSlugs.includes(topic.slug)}
                    onChange={() => toggleSelect(topic.slug)}
                  />
                </td>
                <td className="p-2 border">{topic.name}</td>
                <td className="p-2 border">{topic._count?.posts || 0}</td>
                <td className="p-2 border">
                  {new Date(topic.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <Link
                    href={`/topics/edit/${topic.slug}`}
                    className="text-blue-500 mr-2"
                  >
                    Sửa
                  </Link>
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(topic)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 border rounded ${
                  i === page
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Sau
            </button>
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