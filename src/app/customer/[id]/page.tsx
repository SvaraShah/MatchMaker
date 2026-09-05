import { redirect } from 'next/navigation';

export default async function CustomerRedirectPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  redirect(`/admin/customer/${id}`);
}
