// app/topics/[id]/page.tsx
import TopicDetail from "@/components/TopicDetail";

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  return <TopicDetail topicId={params.id} />;
}
