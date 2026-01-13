"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { userService } from "@/api/user";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

interface AvatarUploaderProps {
  avatarUrl?: string | null;
  onAvatarChange?: (newAvatarUrl: string | null) => void;
}

export default function AvatarUploader({ 
  avatarUrl, 
  onAvatarChange 
}: AvatarUploaderProps) {
  const { user } = useCurrentUser();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl || null);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cập nhật preview khi avatarUrl prop thay đổi
  useEffect(() => {
    setPreviewUrl(avatarUrl || null);
    setHasError(false);
  }, [avatarUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    setHasError(false);

    const filePreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(filePreviewUrl);

    try {
      const result = await userService.uploadAvatar(user.id, file);
      URL.revokeObjectURL(filePreviewUrl);

      const serverAvatarUrl = result.avatar_url;
      setPreviewUrl(serverAvatarUrl);
      onAvatarChange?.(serverAvatarUrl);

      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      URL.revokeObjectURL(filePreviewUrl);
      setPreviewUrl(avatarUrl || null);
      toast.error('Tải ảnh lên thất bại. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;

    if (url.includes('lh3.googleusercontent.com')) {
      return url.replace(/=s\d+(-c)?$/, '=s200');
    }

    if (url.startsWith('http') || url.startsWith('blob:')) return url;

    const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:8080';
    if (url.startsWith('/uploads/')) return `${uploadsUrl}${url}`;
    if (url.startsWith('uploads/')) return `${uploadsUrl}/${url}`;
    return url;
  };

  // Nếu Google avatar lỗi hoặc private, fallback sang avatar mặc định
  const fallbackUrl = `https://www.gravatar.com/avatar/?d=mp&s=200`;
  const displayUrl = hasError ? fallbackUrl : getAvatarUrl(previewUrl);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100">
          <img
            src={displayUrl || undefined}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        </div>

        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-full shadow-lg transition-colors"
        >
          {isUploading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 disabled:bg-blue-50 text-blue-700 rounded-lg transition-colors font-medium"
        >
          {isUploading ? 'Đang tải lên...' : (previewUrl ? 'Thay đổi ảnh' : 'Chọn ảnh')}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center max-w-xs">
        Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP), tối đa 5MB
      </p>
    </div>
  );
}
