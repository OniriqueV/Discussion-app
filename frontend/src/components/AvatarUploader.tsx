"use client";
import { useRef, useState, useEffect } from "react";

interface AvatarUploaderProps {
  avatarUrl?: string; // URL từ database hoặc Google
}

export default function AvatarUploader({ avatarUrl }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // Dọn URL tạm khi component unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const displaySrc = preview || avatarUrl || "/avatar-default.jpg";

  return (
    <div className="flex flex-col items-center">
      <img
        src={displaySrc}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover object-center border mb-2 bg-gray-100"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-sm text-blue-600 hover:underline"
      >
        Chọn ảnh
      </button>
    </div>
  );
}
