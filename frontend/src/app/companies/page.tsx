"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyTable from "@/components/CompanyTable";
import Header from "@/components/Header";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { getCompanies, deleteCompany } from "@/api/companyApi";
import { Company } from "@/mock/companies";
import { toast } from "react-toastify";

export default function CompaniesPage() {
  useAuthRedirect("admin");

  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error("Lỗi khi fetch companies:", error);
        toast.error("Không thể tải danh sách công ty");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/companies/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCompany(id);
      // toast.success("Đã xoá công ty");
      setCompanies(prev => prev.filter(company => company.id !== id));
    } catch (error) {
      console.error("Xoá thất bại:", error);
      toast.error("Không thể xoá công ty");
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => deleteCompany(id)));
      // toast.success("Đã xoá các công ty được chọn");
      setCompanies(prev => prev.filter(c => !ids.includes(c.id)));
    } catch (error) {
      console.error("Xoá hàng loạt thất bại:", error);
      toast.error("Không thể xoá hàng loạt");
    }
  };

  return (
    <>
      <Header showCompanies={false} />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý công ty</h1>
        </div>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <CompanyTable
            companies={companies}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
          />
        )}
      </div>
    </>
  );
}
