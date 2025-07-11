import Header from "@/components/Header";
import PostTable from "@/components/PostTable";

export default function PostsPage() {
  return (
    <>
    <Header showPosts={false} />
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Post Management</h1>
      <PostTable />
    </div>
    </>
  );
}
