// src/app/tags/add/page.tsx
import TagForm from "@/components/TagForm";
import Header from "@/components/Header";

export default function AddTagPage() {
  return (
    <>
      {/* <Header /> */}
      <main className="max-w-3xl mx-auto p-6">
        <TagForm />
      </main>
    </>
  );
}
