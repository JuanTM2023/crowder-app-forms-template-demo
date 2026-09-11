"use server";

import { revalidatePath } from "next/cache";

import { createProducer } from "@/modules/producers";

export async function createProducerAction(formData: FormData) {
  const razon_social = String(formData.get("razon_social"));
  const ruc = String(formData.get("ruc"));
  const direccion = String(formData.get("direccion"));
  const email = String(formData.get("email"));
  const phone = String(formData.get("phone"));

  await createProducer({
    razon_social,
    ruc,
    direccion,
    email,
    phone,
  });

  revalidatePath("/producers");
}
