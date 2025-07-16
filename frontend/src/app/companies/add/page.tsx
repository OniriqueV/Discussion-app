"use client";

import CompanyForm from "@/components/CompanyForm";
import { useRouter } from "next/navigation";
import { createCompany, uploadCompanyLogo } from "@/api/companyApi";
import { toast } from "react-toastify";

export default function AddCompanyPage() {
  const router = useRouter();

  const handleCreate = async (data: any, file?: File) => {
    try {
      // 1. Tạo công ty
      const created = await createCompany({
        name: data.name,
        address: data.address,
        maxUsers: data.maxUsers,
        expiredAt: data.expiredAt,
        active: data.active,
      });

      // 2. Upload logo nếu có
      if (file) {
        await uploadCompanyLogo(created.id, file);
      }

      toast.success("Thêm công ty thành công");
      router.push("/companies");
    } catch (error) {
      console.error("Tạo công ty thất bại", error);
      toast.error("Đã xảy ra lỗi khi tạo công ty");
    }
  };

  return <CompanyForm onSubmit={handleCreate} />;
}
