import Link from "next/link";

import { getProducer } from "@/modules/producers";
import { updateProducerAction } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProducerPage({ params }: Props) {
  const { id } = await params;

  const producer = await getProducer(id);

  if (!producer) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Productor no encontrado</h1>
      </main>
    );
  }

  async function action(formData: FormData) {
    "use server";

    await updateProducerAction(id, formData);
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Editar Productor</h1>

        <Link
          href="/producers"
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Volver
        </Link>
      </div>

      <form action={action} className="rounded-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Razón Social</label>

          <input
            name="razon_social"
            defaultValue={producer.razon_social}
            required
            className="w-full rounded-xl border border-border bg-background p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">RUC</label>

          <input
            name="ruc"
            defaultValue={producer.ruc ?? ""}
            className="w-full rounded-xl border border-border bg-background p-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Dirección</label>

          <input
            name="direccion"
            defaultValue={producer.direccion ?? ""}
            className="w-full rounded-xl border border-border bg-background p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Correo</label>

          <input
            name="email"
            type="email"
            defaultValue={producer.email ?? ""}
            className="w-full rounded-xl border border-border bg-background p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Teléfono</label>

          <input
            name="phone"
            defaultValue={producer.phone ?? ""}
            className="w-full rounded-xl border border-border bg-background p-3"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </main>
  );
}
