import Dashboard from "@/components/Dashboard.tsx";

export default async function CreatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tip?: string; review?: string; welcome?: string }>;
}) {
  const { id } = await params;
  const { tip, review, welcome } = await searchParams;
  return <Dashboard id={id} focusTip={tip} focusReview={review} welcome={welcome === "1"} />;
}
