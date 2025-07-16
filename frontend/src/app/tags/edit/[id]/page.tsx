// src/app/tags/edit/[id]/page.tsx
import TagForm from "@/components/TagForm";
import { getTagById } from "@/mock/tags";
import Header from "@/components/Header";
import { use } from "react";

export default function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tag = getTagById((id));

  if (!tag) {
    return (
      <>
        {/* <Header /> */}
        <div className="p-6 text-red-500">Không tìm thấy tag</div>
      </>
    );
  }

  return (
    <>
      {/* <Header /> */}
      <main className="max-w-3xl mx-auto p-6">
        <TagForm initialData={{ name: tag.name }} />
      </main>
    </>
  );
}
