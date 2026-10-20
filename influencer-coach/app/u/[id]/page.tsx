import Dashboard from "@/components/Dashboard.tsx";

export default async function CreatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tip?: string; welcome?: string }>;
}) {
  const { id } = await params;
  const { tip, welcome } = await searchParams;
  return <Dashboard id={id} focusTip={tip} welcome={welcome === "1"} />;
}
