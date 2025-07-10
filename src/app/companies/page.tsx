"use client";

import { useRouter } from "next/navigation";
import CompanyTable from "@/components/CompanyTable";
import { companiesMock } from "@/mock/companies";
import Header from "@/components/Header";

export default function CompaniesPage() {
  const router = useRouter();

  const handleEdit = (id: number) => {
    router.push(`/companies/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Deleted company with ID: ${id}`);
    // TODO: Implement actual delete logic here
    // Example: await deleteCompany(id);
  };

  const handleBulkDelete = (ids: number[]) => {
    console.log(`Bulk deleted: ${ids.join(", ")}`);
    // TODO: Implement actual bulk delete logic here
    // Example: await bulkDeleteCompanies(ids);
  };

  return (
    <>
      <Header showCompanies={false} />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý công ty</h1>
          {/* Removed duplicate Add button since CompanyTable already has one */}
        </div>
        <CompanyTable
          companies={companiesMock}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
        />
      </div>
    </>
  );
}