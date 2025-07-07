"use client";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
  <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
    <p className="text-gray-900 text-center">{message}</p>
    <div className="mt-6 flex justify-center gap-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
      >
        Huỷ
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
      >
        Xoá
      </button>
    </div>
  </div>
</div>
  );
}
