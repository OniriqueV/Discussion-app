import PostForm from "@/components/PostForm";
import { getPostById } from "@/mock/posts";
import { notFound } from "next/navigation";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post) return notFound();

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Edit Post</h1>
      <PostForm
        initialData={{
          title: post.title,
          description: post.description,
          topicId: post.topicId,
          status: post.status,
          tagIds: post.tagIds,
        }}
      />
    </div>
  );
}
