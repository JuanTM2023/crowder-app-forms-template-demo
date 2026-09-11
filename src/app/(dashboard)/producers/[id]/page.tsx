import Link from "next/link";

import { getProducer } from "@/modules/producers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProducerDetailPage({ params }: Props) {
  const { id } = await params;

  const producer = await getProducer(id);

  if (!producer) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Productor no encontrado</h1>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{producer.razon_social}</h1>

        <Link
          href="/producers"
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Volver
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Razón Social</div>

            <div className="mt-1 font-medium">{producer.razon_social}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">RUC</div>

            <div className="mt-1 font-medium">{producer.ruc}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Correo</div>

            <div className="mt-1 font-medium">{producer.email}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Teléfono</div>

            <div className="mt-1 font-medium">{producer.phone}</div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground">Dirección</div>

            <div className="mt-1 font-medium">
              {producer.direccion || "No registrada"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
