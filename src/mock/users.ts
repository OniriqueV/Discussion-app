// mock/users.ts
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  company: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
};

const companies = [
  "TechCorp",
  "DataSoft",
  "CloudWorks",
  "InnovateLab",
  "DigitalFlow",
  "SystemPlus",
  "NetSolution",
  "CodeFactory"
];

const roles = ["admin", "ca_user", "member"];

export const usersMock: User[] = [
  // Admin user - chỉ có 1 user duy nhất
  {
    id: 1,
    name: "Admin",
    email: "admin@system.com",
    role: "admin",
    status: "active",
    company: "TechCorp",
    dateOfBirth: new Date("1980-05-15").toISOString(),
    createdAt: new Date("2024-01-15T08:00:00Z").toISOString(),
    updatedAt: new Date("2024-12-01T10:30:00Z").toISOString(),
  },
  // Các user khác
  ...Array.from({ length: 25 }, (_, i) => {
    const id = i + 2;
    const roleIndex = i % 2; // Chỉ ca_user hoặc member
    const companyIndex = i % companies.length;
    const isActive = i % 3 !== 0; // Phần lớn active

    // Tạo ngày sinh ngẫu nhiên từ 1970-2000
    const birthYear = 1970 + Math.floor(Math.random() * 30);
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = new Date(birthYear, birthMonth, birthDay);

    return {
      id,
      name: `Người dùng ${id}`,
      email: `user${id}@example.com`,
      role: roles[roleIndex + 1], // ca_user hoặc member
      status: (isActive ? "active" : "inactive") as "active" | "inactive",
      company: companies[companyIndex],
      dateOfBirth: dateOfBirth.toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    } as User;
  })
];

// Helper functions for mock data
export const getUserById = (id: number): User | undefined => {
  return usersMock.find(user => user.id === id);
};

export const getUsersByRole = (role: string): User[] => {
  return usersMock.filter(user => user.role === role);
};

export const getUsersByStatus = (status: "active" | "inactive"): User[] => {
  return usersMock.filter(user => user.status === status);
};

export const getUsersByCompany = (company: string): User[] => {
  return usersMock.filter(user => user.company === company);
};

export const searchUsers = (query: string): User[] => {
  const lowercaseQuery = query.toLowerCase();
  return usersMock.filter(user =>
    user.name.toLowerCase().includes(lowercaseQuery) ||
    user.email.toLowerCase().includes(lowercaseQuery) ||
    user.company.toLowerCase().includes(lowercaseQuery)
  );
};

export const getAdminUser = (): User | undefined => {
  return usersMock.find(user => user.role === "admin");
};

export const getAllCompanies = (): string[] => {
  return [...new Set(usersMock.map(user => user.company))];
};

export const getUsersByAgeRange = (minAge: number, maxAge: number): User[] => {
  const currentYear = new Date().getFullYear();
  return usersMock.filter(user => {
    const birthYear = new Date(user.dateOfBirth).getFullYear();
    const age = currentYear - birthYear;
    return age >= minAge && age <= maxAge;
  });
};

export const getUserAge = (user: User): number => {
  const birthDate = new Date(user.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getUserStats = () => {
  const totalUsers = usersMock.length;
  const activeUsers = usersMock.filter(user => user.status === "active").length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminCount = usersMock.filter(user => user.role === "admin").length;
  const caUserCount = usersMock.filter(user => user.role === "ca_user").length;
  const memberCount = usersMock.filter(user => user.role === "member").length;
  
  // Thống kê theo độ tuổi
  const averageAge = usersMock.reduce((sum, user) => sum + getUserAge(user), 0) / totalUsers;
  const youngUsers = getUsersByAgeRange(18, 30).length;
  const middleAgedUsers = getUsersByAgeRange(31, 50).length;
  const seniorUsers = getUsersByAgeRange(51, 100).length;
  
  return {
    total: totalUsers,
    active: activeUsers,
    inactive: inactiveUsers,
    admin: adminCount,
    ca_user: caUserCount,
    member: memberCount,
    companies: getAllCompanies().length,
    averageAge: Math.round(averageAge),
    youngUsers,
    middleAgedUsers,
    seniorUsers
  };
};