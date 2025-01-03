"use client";

import { ShareView } from "@/components";

interface Props {
  params: { shareId: string };
}

export default function SharePage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <ShareView shareId={params.shareId} />
    </div>
  );
}
