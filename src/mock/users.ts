// mock/users.ts
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
};

export const usersMock: User[] = Array.from({ length: 26 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "ca_user" : "member",
  status: i % 2 === 0 ? "active" : "inactive",
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
}));

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

export const searchUsers = (query: string): User[] => {
  const lowercaseQuery = query.toLowerCase();
  return usersMock.filter(user => 
    user.name.toLowerCase().includes(lowercaseQuery) ||
    user.email.toLowerCase().includes(lowercaseQuery)
  );
};