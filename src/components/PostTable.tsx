"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Post, postsMock } from "@/mock/posts";
import { useFilterSortPaginate } from "@/hooks/useFilterSortPaginate";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import ConfirmModal from "./ConfirmModal";
import { toast } from "react-toastify";


type SortField = "title" | "author" | "status";

export default function PostTable() {
  const router = useRouter();
  const [data, setData] = useState(postsMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
  const posts = postsMock;
  const {
    paginatedData,
    filteredData,
    totalPages,
    currentPage,
    setPage,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    } = useFilterSortPaginate(posts, DEFAULT_PAGE_SIZE, {
    searchTerm,
    searchFields: ["title", "author", "status"],
    initialSortField: "title",
    initialSortOrder: "asc",
});


  const handleSort = (field: SortField) => {
    if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // ✅ trực tiếp so sánh giá trị hiện tại
        } else {
        setSortField(field);
        setSortOrder("asc");
        }

  };


  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedData.map((p) => p.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmVisible(true);
  };

  const handleDelete = (id: string) => {
    showConfirm("Bạn có chắc muốn xoá bài viết này?", () => {
      setData((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      toast.success(MESSAGES.SUCCESS_DELETE_POST || "Xoá bài viết thành công");
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn(MESSAGES.WARNING_SELECT_USERS || "Chọn bài viết để xoá");
      return;
    }
    showConfirm(`Xoá ${selectedIds.length} bài viết đã chọn?`, () => {
      setData((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      toast.success(MESSAGES.SUCCESS_BULK_DELETE_POST || "Xoá hàng loạt thành công");
    });
  };

  const handleAdd = () => router.push("/posts/add");
  const handleEdit = (id: string) => router.push(`/posts/edit/${id}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Quản lý bài viết</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thêm bài viết
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Xoá đã chọn ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Hiển thị {paginatedData.length} / {filteredData.length} bài viết
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every((p) => selectedIds.includes(p.id))
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th
                className="px-3 py-2 border-b cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Tiêu đề {getSortIcon("title")}
              </th>
              <th
                className="px-3 py-2 border-b cursor-pointer"
                onClick={() => handleSort("author")}
              >
                Tác giả {getSortIcon("author")}
              </th>
              <th
                className="px-3 py-2 border-b cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Trạng thái {getSortIcon("status")}
              </th>
              <th className="px-3 py-2 border-b">Tags</th>
              <th className="px-3 py-2 border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Không có bài viết nào
                </td>
              </tr>
            ) : (
              paginatedData.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={() => toggleSelect(post.id)}
                    />
                  </td>
                  <td className="px-3 py-2 border-b">{post.title}</td>
                  <td className="px-3 py-2 border-b">{post.author}</td>
                  <td className="px-3 py-2 border-b capitalize">
                    {post.status.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2 border-b">{post.tagIds.join(", ")}</td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 border rounded ${
                  i === currentPage ? "bg-blue-600 text-white" : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

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
