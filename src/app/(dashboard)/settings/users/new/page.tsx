import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const producers =
    await db.query.producers.findMany();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        Nuevo Usuario
      </h1>

      <div className="mt-6 max-w-2xl">
        <form className="space-y-4">

          <input
            name="fullName"
            placeholder="Nombre completo"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-black"
          />

          <select
  name="documentType"
  className="w-full rounded-xl border border-border px-4 py-3 text-black"
  required
>
  <option value="">
    Seleccione tipo
  </option>

  <option value="DNI">
    DNI
  </option>

  <option value="CE">
    Carnet de Extranjería
  </option>

  <option value="PASSPORT">
    Pasaporte
  </option>

  <option value="RUC">
    RUC
  </option>
</select>

          <input
            name="documentNumber"
            placeholder="Número Documento"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-black"
          />

          <input
            name="email"
            type="email"
            placeholder="Correo"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-black"
          />

          <input
            name="phone"
            placeholder="Teléfono"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-black"
          />

          <input
            type="date"
            name="birthDate"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-black"
          />

          <select
            name="role"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-black"
          >
              <option value="">
              Seleccione un Rol
              </option>

            <option value="ADMIN">
              ADMIN
            </option>

            <option value="SUPERVISOR">
              SUPERVISOR
            </option>

            <option value="OPERARIO">
              OPERARIO
            </option>
          </select>

          <select
            name="producerCode"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-black"
          >
            <option value="">
              Sin Productora
            </option>

            {producers.map((producer) => (
              <option
                key={producer.id}
                value={producer.razon_social}
              >
                {producer.razon_social}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-3 text-white"
          >
            Guardar Usuario
          </button>

        </form>
      </div>
    </main>
  );
}