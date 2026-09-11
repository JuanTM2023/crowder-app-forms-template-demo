import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { producers } from "@/lib/db/schema";

export async function listProducers() {
  return db.select().from(producers).orderBy(asc(producers.razon_social));
}

export async function createProducer(input: {
  razon_social: string;
  ruc: string;
  direccion: string;
  email: string;
  phone: string;
}) {
  const [row] = await db.insert(producers).values(input).returning();

  return row;
}

export async function updateProducer(
  id: string,
  input: {
    razon_social: string;
    ruc: string;
    direccion: string;
    email: string;
    phone: string;
  },
) {
  const [row] = await db
    .update(producers)
    .set(input)
    .where(eq(producers.id, id))
    .returning();

  return row;
}

export async function getProducer(id: string) {
  const [row] = await db.select().from(producers).where(eq(producers.id, id));

  return row ?? null;
}
