"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CustomDatePicker from "@/components/DatePicker";
import { useState, useEffect } from "react";

export interface Company {
  id: number;
  account: string;
  name: string;
  logo?: string;
  address: string;
  maxUsers: number;
  expiredAt: Date | null;
  active: boolean;
}

type FormValues = {
  name: string;
  logo: string;
  address: string;
  maxUsers: number;
  expiredAt: Date | null;
  active: boolean;
};

interface Props {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues, file?: File) => Promise<void>;
}



export default function CompanyForm({ initialData ,onSubmit}: Props) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(initialData?.logo || null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(initialData?.logo || null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name || "",
      logo: initialData?.logo || "",
      address: initialData?.address || "",
      maxUsers: initialData?.maxUsers || 1,
      expiredAt: initialData?.expiredAt ? new Date(initialData.expiredAt) : null,
      active: initialData?.active ?? true,
    },
  });

  const isEdit = Boolean(initialData?.name);

  const handleFormSubmit = async (data: FormValues) => {
    try {
      const fileToSend: File | undefined = file ?? undefined;
      await onSubmit(data, fileToSend);

    } catch (e) {
      toast.error("Đã xảy ra lỗi khi lưu");
    }
  };


  // const onSubmit = async (data: FormValues) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("name", data.name);
  //     formData.append("address", data.address);
  //     formData.append("maxUsers", String(data.maxUsers));
  //     formData.append("expiredAt", data.expiredAt?.toISOString() || "");
  //     formData.append("active", String(data.active));

  //     if (file) {
  //       formData.append("file", file); // send file
  //     } else if (initialData?.logo) {
  //       formData.append("logo", initialData.logo); // fallback if editing without new file
  //     }

  //     const res = await fetch(isEdit ? "/api/companies/update" : "/api/companies", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!res.ok) throw new Error("Upload failed");

  //     const result = await res.json();

  //     toast.success(isEdit ? "Cập nhật công ty thành công" : "Thêm công ty thành công");
  //     router.push("/companies");
  //   } catch (e) {
  //     toast.error("Đã xảy ra lỗi khi lưu");
  //   }
  // };

  useEffect(() => {
    if (initialData?.logo) {
      setPreview(initialData.logo);
      setFileName(initialData.logo.split("/").pop() ?? initialData.logo);
    }
  }, [initialData]);

  return (
    <div className="relative max-w-xl mx-auto p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-6 right-6 text-sm text-blue-600 hover:underline"
      >
        Quay lại
      </button>

      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Chỉnh sửa công ty" : "Thêm công ty"}
      </h1>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Tên công ty</label>
          <input
            {...register("name", { required: "Tên công ty là bắt buộc" })}
            className="w-full border px-3 py-2 rounded"
            placeholder="Nhập tên công ty"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Logo công ty</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) {
                const objectUrl = URL.createObjectURL(selected);
                setFile(selected);
                setPreview(objectUrl);
                setFileName(selected.name);
              }
            }}
            className="w-full border px-3 py-2 rounded"
          />
          {fileName && (
            <span className="text-sm text-gray-600 mt-1 block">Đã chọn: {fileName}</span>
          )}
          {preview && (
            <img
              src={preview}
              alt="Logo preview"
              className="h-20 mt-2 rounded border object-contain"
            />
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Địa chỉ</label>
          <textarea
            {...register("address", { required: "Địa chỉ là bắt buộc" })}
            className="w-full border px-3 py-2 rounded"
            rows={3}
            placeholder="Nhập địa chỉ công ty"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Số lượng user tối đa</label>
          <input
            {...register("maxUsers", {
              required: "Số lượng user tối đa là bắt buộc",
              min: { value: 1, message: "Số lượng user phải lớn hơn 0" },
            })}
            type="number"
            min="1"
            className="w-full border px-3 py-2 rounded"
            placeholder="Nhập số lượng user tối đa"
          />
          {errors.maxUsers && <p className="text-red-500 text-sm">{errors.maxUsers.message}</p>}
        </div>

        <div>
          <Controller
            name="expiredAt"
            control={control}
            rules={{ required: "Ngày hết hạn là bắt buộc" }}
            render={({ field: { onChange, value } }) => (
              <CustomDatePicker
                label="Ngày hết hạn"
                value={value}
                onChange={onChange}
                error={errors.expiredAt?.message}
                minDate={new Date(1925, 0, 1)}
                maxDate={new Date()}
                showYearDropdown
                showMonthDropdown
              />
            )}
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              {...register("active")}
              type="checkbox"
              className="w-4 h-4"
            />
            <span className="text-sm">Kích hoạt</span>
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </button>
      </form>
    </div>
  );
}
