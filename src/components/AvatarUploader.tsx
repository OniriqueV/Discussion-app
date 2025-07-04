// components/AvatarUploader.tsx
"use client";
import { useRef, useState } from "react";

export default function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <img
        src={preview || "/avatar-default.jpg"}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover object-contain border mb-2 bg-gray-100"
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
