// app/posts/edit/[id]/page.tsx
import PostForm from "@/components/PostForm";

interface Props {
  params: {
    id: string;
  };
}

export default function EditPostPage({ params }: Props) {
  const postId = parseInt(params.id);
  
  if (isNaN(postId)) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-red-600">ID bài viết không hợp lệ</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Chỉnh sửa bài viết</h1>
      <PostForm postId={postId} />
    </div>
  );
}