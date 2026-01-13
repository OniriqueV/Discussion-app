"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import { Tag, tagApi } from "@/api/tag";

// --- Main component ---
export default function TagTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "postCount" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});


  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await tagApi.findAll();
        setTags(res.data);
      } catch (err) {
        toast.error("Không thể tải danh sách tag");
      }
    };

    fetchTags();
  }, []);
  
  const filteredSorted = useMemo(() => {
    let filtered = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

    filtered.sort((a, b) => {
      const aVal = String(a[sortKey] ?? "");
      const bVal = String(b[sortKey] ?? "");

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tags, search, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredSorted.length / DEFAULT_PAGE_SIZE);
  const paginatedTags = filteredSorted.slice(
    page * DEFAULT_PAGE_SIZE,
    (page + 1) * DEFAULT_PAGE_SIZE
  );

  const toggleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: typeof sortKey) => {
    if (sortKey !== key) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedTags.map((t) => t.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const handleDelete = (tag: Tag) => {
    setConfirmMessage(`Bạn có chắc muốn xoá tag "${tag.name}"?`);
    setOnConfirmAction(() => async () => {
      try {
        await tagApi.delete(tag.slug);
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
        setSelectedIds((prev) => prev.filter((id) => id !== tag.id));
        toast.success(MESSAGES.SUCCESS_DELETE_TAG);
      } catch (error) {
        toast.error("Xoá tag thất bại");
      }
    });
    setConfirmVisible(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một tag để xoá.");
      return;
    }

    setConfirmMessage(`Bạn có chắc muốn xoá ${selectedIds.length} tag đã chọn?`);
    setOnConfirmAction(() => async () => {
      try {
        await tagApi.bulkDelete({ slugs: tags.filter(t => selectedIds.includes(t.id)).map(t => t.slug) });
        setTags((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
        setSelectedIds([]);
        toast.success(MESSAGES.SUCCESS_BULK_DELETE_TAG);
      } catch (error) {
        toast.error("Xoá hàng loạt thất bại");
      }
    });
    setConfirmVisible(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên tag..."
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

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">
              <input
                type="checkbox"
                checked={paginatedTags.length > 0 && paginatedTags.every((t) => selectedIds.includes(t.id))}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="p-2 border cursor-pointer" onClick={() => toggleSort("name")}>Tên Tag {getSortIcon("name")}</th>
            <th className="p-2 border cursor-pointer" onClick={() => toggleSort("postCount")}>Số bài viết {getSortIcon("postCount")}</th>
            <th className="p-2 border cursor-pointer" onClick={() => toggleSort("created_at")}>Ngày tạo {getSortIcon("created_at")}</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTags.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">Không có tag nào</td>
            </tr>
          ) : (
            paginatedTags.map((tag) => (
              <tr key={tag.id}>
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tag.id)}
                    onChange={() => toggleSelect(tag.id)}
                  />
                </td>
                <td className="p-2 border">{tag.name}</td>
                <td className="p-2 border">{tag.postCount}</td>
                <td className="p-2 border">{new Date(tag.created_at).toLocaleDateString()}</td>
                <td className="p-2 border">
                  <Link href={`/tags/edit/${tag.slug}`} className="text-blue-500 mr-2">Sửa</Link>
                  <button className="text-red-500" onClick={() => handleDelete(tag)}>Xoá</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">Trang {page + 1} / {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50">Trước</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 border rounded ${i === page ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50">Sau</button>
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
