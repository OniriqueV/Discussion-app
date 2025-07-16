import axios from "axios";
import { Company } from "@/mock/companies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Lấy token từ localStorage
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

// 🔹 Get all companies with high limit (bỏ phân trang)
export const getCompanies = async (): Promise<Company[]> => {
  const res = await axios.get(`${API_URL}/companies?limit=1000`, {
    headers: getAuthHeaders(),
  });

  const rawCompanies = res.data.data;

  return rawCompanies.map((c: any) => ({
    id: c.id,
    name: c.name,
    account: c.account ?? "",
    logo: c.logo,
    address: c.address,
    maxUsers: c.max_users,
    expiredAt: c.expired_time ? new Date(c.expired_time) : null,
    active: c.status === "active",
    status: c.status,
    numberOfUsers: c._count?.users ?? 0,
    users: c.users ?? [],
  }));
};

// 🔹 Get one company by ID
export const getCompany = async (id: number): Promise<Company> => {
  const res = await axios.get(`${API_URL}/companies/${id}`, {
    headers: getAuthHeaders(),
  });

  const c = res.data;
  return {
    id: c.id,
    name: c.name,
    account: c.account ?? "",
    logo: c.logo,
    address: c.address,
    maxUsers: c.max_users,
    expiredAt: c.expired_time ? new Date(c.expired_time) : null,
    active: c.status === "active",
    status: c.status,
    numberOfUsers: c._count?.users ?? 0,
    
  };
};

// 🔹 Create new company
export const createCompany = async (data: Partial<Company>) => {
  const res = await axios.post(`${API_URL}/companies`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// 🔹 Update company
export const updateCompany = async (id: number, data: Partial<Company>) => {
  const res = await axios.patch(`${API_URL}/companies/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// 🔹 Delete company (soft delete)
export const deleteCompany = async (id: number) => {
  const res = await axios.delete(`${API_URL}/companies/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// 🔹 Upload logo
export const uploadCompanyLogo = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("logo", file);

  const res = await axios.post(`${API_URL}/companies/${id}/upload-logo`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
