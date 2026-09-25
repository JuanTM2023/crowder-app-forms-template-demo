import Link from "next/link";

import { listProducers } from "@/modules/producers";
import { createProducerAction } from "@/app/(dashboard)/producers/actions";

export const dynamic = "force-dynamic";

export default async function ProducersPage() {
  const producers = await listProducers();
  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Productores</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Gestiona las productoras asociadas a tus eventos.
        </p>
      </div>

      <form action={createProducerAction}>
        <h2 className="mb-8 rounded-2">Nuevo Productor</h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Registra una nueva productora para asociarla a eventos, comisiones y
          configuraciones futuras.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Razón Social
            </label>

            <input
              name="razon_social"
              placeholder="Ticketmaster Perú SAC"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">RUC</label>

            <input
              name="ruc"
              placeholder="20548745268"
              maxLength={11}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Dirección</label>

            <input
              name="direccion"
              placeholder="Av. Javier Prado Este 1234, San Isidro"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Correo</label>

            <input
              name="email"
              type="email"
              placeholder="eventos@productora.com"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Teléfono</label>

            <input
              name="phone"
              placeholder="999999999"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Guardar Productor
          </button>
        </div>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Productores Registrados</h2>

        <span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
          {producers.length} productor(es)
        </span>
      </div>

      {producers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">
            No hay productores registrados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {producers.map((producer) => (
            <div
              key={producer.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {producer.razon_social}
                  </h3>

                  <div className="mt-3 text-sm">
                    <span className="font-medium">RUC:</span> {producer.ruc}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/settings/producers/${producer.id}`}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted text-center"
                  >
                    Ver Detalle
                  </Link>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/settings/producers/${producer.id}/edit`}
                      className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted text-center"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
