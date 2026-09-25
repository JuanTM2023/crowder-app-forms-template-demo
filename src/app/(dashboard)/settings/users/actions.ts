"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { internalUsers } from "@/lib/db/schema";

export async function createUserAction(
  formData: FormData,
) {
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

    producerCode:
      formData.get("producerCode") as string,

    active: true,
  });

redirect("/settings/users");

}