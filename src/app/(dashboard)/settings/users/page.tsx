import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await db.query.internalUsers.findMany();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Usuarios
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Administración de usuarios internos.
      </p>

      <div className="mt-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="mb-4 rounded-xl border border-border p-4"
          >
            <div>{user.fullName}</div>
            <div>{user.email}</div>
            <div>{user.role}</div>
            <div>{user.producerCode ?? "-"}</div>
          </div>
        ))}
      </div>
    </main>
  );
}