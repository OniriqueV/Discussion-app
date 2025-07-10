import CompanyForm from "@/components/CompanyForm";
import Header from "@/components/Header";
import { getCompanyById } from "@/mock/companies";
import { use } from "react";

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const parsedId = parseInt(id, 10);

  const company = getCompanyById(parsedId);

  if (!company) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto p-6">
          <p className="text-red-500">Không tìm thấy công ty</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <CompanyForm
          initialData={{
            ...company,
            expiredAt: company.expiredAt ? new Date(company.expiredAt) : null,
          }}
        />
      </div>
    </>
  );
}
