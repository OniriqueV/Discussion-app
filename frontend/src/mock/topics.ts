export interface Topic {
  id: string;
  name: string;
  postCount: number;
  createdAt: string; // ISO string
}

export let topicsMock: Topic[] = [
  { id: "1", name: "React", postCount: 12, createdAt: "2024-12-01T00:00:00Z" },
  { id: "2", name: "Next.js", postCount: 8, createdAt: "2025-02-15T00:00:00Z" },
  { id: "3", name: "TypeScript", postCount: 20, createdAt: "2025-01-10T00:00:00Z" },
  { id: "4", name: "Node.js", postCount: 14, createdAt: "2025-03-05T00:00:00Z" },
  { id: "5", name: "Express", postCount: 5, createdAt: "2024-11-20T00:00:00Z" },
  { id: "6", name: "MongoDB", postCount: 10, createdAt: "2025-01-25T00:00:00Z" },
  { id: "7", name: "GraphQL", postCount: 7, createdAt: "2025-04-10T00:00:00Z" },
  { id: "8", name: "Redux", postCount: 9, createdAt: "2024-10-05T00:00:00Z" },
  { id: "9", name: "Jest", postCount: 4, createdAt: "2024-09-01T00:00:00Z" },
  { id: "10", name: "Tailwind CSS", postCount: 13, createdAt: "2025-05-20T00:00:00Z" },
  { id: "11", name: "Zustand", postCount: 3, createdAt: "2024-12-10T00:00:00Z" },
  { id: "12", name: "React Hook Form", postCount: 6, createdAt: "2025-06-01T00:00:00Z" },
  { id: "13", name: "Vite", postCount: 11, createdAt: "2025-06-15T00:00:00Z" },
];

export const getTopicById = (id: string): Topic | undefined => {
  return topicsMock.find((t) => t.id === id);
};

export const deleteTopicById = (id: string) => {
  topicsMock = topicsMock.filter((t) => t.id !== id);
};
