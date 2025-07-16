"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCompany, updateCompany, uploadCompanyLogo } from "@/api/companyApi";
import CompanyForm from "@/components/CompanyForm";
import { toast } from "react-toastify";
import { Company } from "@/mock/companies";

export default function EditCompanyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<Company> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await getCompany(Number(id));
        setInitialData(data);
      } catch (error) {
        toast.error("Không thể tải thông tin công ty");
        router.push("/companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, router]);

  const handleUpdate = async (formData: any, file?: File) => {
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        max_users: formData.maxUsers,
        expired_time: formData.expiredAt?.toISOString(),
        status: formData.active ? "active" as const : "inactive" as const,
      };

      const updated = await updateCompany(Number(id), payload);

      if (file) {
        await uploadCompanyLogo(Number(id), file);
      }

      toast.success("Cập nhật công ty thành công");
      router.push("/companies");
    } catch (error) {
      console.error("Lỗi cập nhật công ty:", error);
      toast.error("Không thể cập nhật công ty");
    }
  };

  if (loading || !initialData) {
    return <p className="p-6">Đang tải dữ liệu công ty...</p>;
  }

  return <CompanyForm initialData={initialData} onSubmit={handleUpdate} />;
}