import { redirect } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id: organizationId, projectId } = await params;

  redirect(`/organizations/${organizationId}/projects/${projectId}/summary`);
}
