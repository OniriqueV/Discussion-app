"use client";
import { Topic } from "@/mock/topics";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

type SortKey = "name" | "postCount" | "createdAt";

export default function TopicTable({ topics }: { topics: Topic[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [data, setData] = useState(topics);
  const [page, setPage] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  const filteredSorted = useMemo(() => {
    let filtered = data.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedTopics.map((t) => t.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const handleDelete = (topic: Topic) => {
    setConfirmMessage(`Bạn có chắc muốn xoá topic "${topic.name}"?`);
    setOnConfirmAction(() => () => {
      setData((prev) => prev.filter((t) => t.id !== topic.id));
      setSelectedIds((prev) => prev.filter((id) => id !== topic.id));
      toast.success(MESSAGES.SUCCESS_DELETE_TOPIC);
    });
    setConfirmVisible(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một topic để xoá.");
      return;
    }

    setConfirmMessage(`Bạn có chắc muốn xoá ${selectedIds.length} topic đã chọn?`);
    setOnConfirmAction(() => () => {
      setData((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      toast.success(MESSAGES.SUCCESS_BULK_DELETE_TOPIC);
    });
    setConfirmVisible(true);
  };

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
          disabled={selectedIds.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Xoá đã chọn ({selectedIds.length})
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
                  paginatedTopics.every((t) => selectedIds.includes(t.id))
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
            <th className="p-2 border cursor-pointer" onClick={() => toggleSort("createdAt")}>
              Ngày tạo {getSortIcon("createdAt")}
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
                    checked={selectedIds.includes(topic.id)}
                    onChange={() => toggleSelect(topic.id)}
                  />
                </td>
                <td className="p-2 border">{topic.name}</td>
                <td className="p-2 border">{topic.postCount}</td>
                <td className="p-2 border">
                  {new Date(topic.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <Link
                    href={`/topics/edit/${topic.id}`}
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
