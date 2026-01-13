// src/app/posts/mypost/page.tsx

"use client";

import Header from "@/components/Header";
import MyPostList from "@/components/MyPostList";
export default function MyPostsPage() {
  return (
    <>
      <Header showPosts={false} />
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-semibold">Bài viết của tôi</h1>
        <MyPostList />
      </div>
    </>
  );
}
