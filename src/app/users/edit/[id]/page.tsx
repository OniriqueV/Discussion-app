
// src/app/users/edit/[id]/page.tsx
import Header from "@/components/Header";
import UserForm from "@/components/UserForm";
import { use } from "react";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // unwrap params with use()

  const parsedId = parseInt(id, 10);

  // Mock user (thực tế nên fetch từ API)
  const user = {
    id: parsedId,
    name: "Nguyễn Văn A",
    email: "user@example.com",
    status: "active",
  };

  return ( 
  <>
    <Header />
    <div className="max-w-3xl mx-auto p-6">
     
      <UserForm initialData={user} />
    </div>
  </>
  );
}
