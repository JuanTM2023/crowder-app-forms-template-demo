import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

  interface Props {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function UsersPage({
  searchParams,
}: Props) {
  const users = await db.query.internalUsers.findMany();

const { q = "" } = await searchParams;

const filteredUsers = users.filter(
  (user) =>
    user.fullName
      .toLowerCase()
      .includes(q.toLowerCase()) ||
    user.email
      .toLowerCase()
      .includes(q.toLowerCase())
);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Usuarios
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Administración de usuarios internos.
      </p>

      <form className="mt-6">
  <input
    type="text"
    name="q"
    defaultValue={q}
    placeholder="Buscar usuario..."
    className="w-full max-w-md rounded-xl border border-border bg-background px-4 py-3"
  />
</form>

<div className="mt-4 flex justify-end">
  <a
    href="/settings/users/new">nuevo Usuario
  </a>
</div>

<div className="mt-8 overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-border">
        <th className="p-3 text-left">Nombre</th>
        <th className="p-3 text-left">Correo</th>
        <th className="p-3 text-left">Rol</th>
        <th className="p-3 text-left">Productora</th>
        <th className="p-3 text-left">Estado</th>
        <th className="p-3 text-left">Acciones</th>
      </tr>
    </thead>

    <tbody>
      {filteredUsers.map((user) => (
        <tr
          key={user.id}
          className="border-b border-border"
        >
          <td className="p-3">
            {user.fullName}
          </td>

          <td className="p-3">
            {user.email}
          </td>

          <td className="p-3">
            {user.role}
          </td>

          <td className="p-3">
            {user.producerCode ?? "-"}
          </td>

          <td className="p-3">
            {user.active ? "Activo" : "Inactivo"}
          </td>

          <td className="p-3">
          <a href={`/settings/users/${user.id}`}>Acciones
          </a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </main>
  );
}