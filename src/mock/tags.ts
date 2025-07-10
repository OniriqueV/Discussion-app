export interface Tag {
  id: string;
  name: string;
  postCount: number;
  createdAt: string; // ISO string
}

export let tagsMock: Tag[] = [
  { id: "1", name: "Frontend", postCount: 15, createdAt: "2024-12-10T00:00:00Z" },
  { id: "2", name: "Backend", postCount: 12, createdAt: "2025-01-08T00:00:00Z" },
  { id: "3", name: "Database", postCount: 9, createdAt: "2025-02-14T00:00:00Z" },
  { id: "4", name: "DevOps", postCount: 7, createdAt: "2024-11-22T00:00:00Z" },
  { id: "5", name: "API", postCount: 11, createdAt: "2025-03-17T00:00:00Z" },
  { id: "6", name: "Security", postCount: 5, createdAt: "2024-09-30T00:00:00Z" },
  { id: "7", name: "Testing", postCount: 10, createdAt: "2025-01-20T00:00:00Z" },
  { id: "8", name: "Performance", postCount: 6, createdAt: "2025-04-05T00:00:00Z" },
  { id: "9", name: "Design Patterns", postCount: 8, createdAt: "2024-10-18T00:00:00Z" },
  { id: "10", name: "CI/CD", postCount: 4, createdAt: "2025-06-25T00:00:00Z" },
  { id: "11", name: "Cloud", postCount: 13, createdAt: "2025-05-01T00:00:00Z" },
  { id: "12", name: "Authentication", postCount: 3, createdAt: "2025-06-10T00:00:00Z" },
  { id: "13", name: "Caching", postCount: 2, createdAt: "2025-07-01T00:00:00Z" },
];

export const getTagById = (id: string): Tag | undefined => {
  return tagsMock.find((t) => t.id === id);
};

export const deleteTagById = (id: string) => {
  tagsMock = tagsMock.filter((t) => t.id !== id);
};
