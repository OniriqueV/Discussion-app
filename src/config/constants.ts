// config/constants.tsx
export const DEFAULT_PAGE_SIZE = 10;

export const USER_ROLES = ["admin", "ca_user", "member"] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
] as const;

export const SORT_ORDERS = ["asc", "desc"] as const;

export const FILTER_OPTIONS = {
  ALL: "all",
  ACTIVE: "active", 
  INACTIVE: "inactive"
} as const;

export const MESSAGES = {
  CONFIRM_DELETE: "Xác nhận xoá",
  CONFIRM_BULK_DELETE: "Bạn có chắc muốn xoá {count} người dùng?",
  SUCCESS_DELETE: "Đã xoá người dùng",
  SUCCESS_BULK_DELETE: "Đã xoá người dùng đã chọn",
  WARNING_SELECT_USERS: "Vui lòng chọn ít nhất 1 người dùng",
  SEARCH_PLACEHOLDER: "Tìm kiếm theo tên hoặc email...",
  NO_USERS_FOUND: "Không tìm thấy người dùng nào"
} as const;