interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage(
  { params }: Props
) {
  const { id } = await params;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Usuario
      </h1>

      <p>ID: {id}</p>
    </main>
  );
}