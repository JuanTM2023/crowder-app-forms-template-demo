"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { internalUsers, producers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createUserAction(
  formData: FormData,
) {

  const producerId =
  (formData.get("producerId") as string) || null;

let producerCode = null;

if (producerId) {
  const producer =
    await db.query.producers.findFirst({
      where: eq(
        producers.id,
        producerId,
      ),
    });

  producerCode =
    producer?.razon_social ?? null;
}

  await db.insert(internalUsers).values({
    fullName:
      formData.get("fullName") as string,

    documentType:
      formData.get("documentType") as string,

    documentNumber:
      formData.get("documentNumber") as string,

    email:
      formData.get("email") as string,

    phone:
      formData.get("phone") as string,

    birthDate:
      formData.get("birthDate")
        ? new Date(
            formData.get("birthDate") as string,
          )
        : null,

    role:
      formData.get("role") as string,

    producerId,
    producerCode,

    active: true,
  });

redirect("/settings/users");

}