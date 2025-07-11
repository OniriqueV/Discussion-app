// app/posts/detail/[id]/page.tsx
import PostDetail from "@/components/PostDetail";

interface Props {
  params: {
    id: string;
  };
}

export default function PostDetailPage({ params }: Props) {
  return <PostDetail postId={params.id} />;
}
