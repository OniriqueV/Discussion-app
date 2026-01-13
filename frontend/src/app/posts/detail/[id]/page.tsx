import Header from "@/components/Header";
import PostDetail from "@/components/PostDetail";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params; // 🔥 đây là dòng cần thiết
  return (
    <>
      <Header showPosts={false} />
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-semibold">Chi tiết bài viết</h1>
        <PostDetail postId={id} />
      </div>
    </>
  );
}
