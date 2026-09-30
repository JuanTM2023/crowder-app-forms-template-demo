"use server";

import { db } from "@/lib/db";
import { internalUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getServiceSupabase } from "@/adapters/supabase/server";

export async function updateUserAction(
  formData: FormData,
) {
  const id =
    formData.get("id") as string;

  await db
    .update(internalUsers)
    .set({
      fullName:
        formData.get(
          "fullName",
        ) as string,

      email:
        formData.get(
          "email",
        ) as string,

      documentNumber:
        formData.get(
          "documentNumber",
        ) as string,

      phone:
        (formData.get(
          "phone",
        ) as string) || null,

      role:
        formData.get(
          "role",
        ) as string,

      producerCode:
        (formData.get(
          "producerCode",
        ) as string) || null,

      active:
        formData.get(
          "active",
        ) === "true",
    })
    .where(eq(internalUsers.id, id));

  redirect("/settings/users");
}

export async function resetPasswordAction(
  formData: FormData,
) {
  const id =
    formData.get("id") as string;

  const user =
    await db.query.internalUsers.findFirst({
      where: eq(internalUsers.id, id),
    });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const supabase =
    getServiceSupabase();

    console.log("EMAIL:", user.email);

const { error } =
  await supabase.auth.resetPasswordForEmail(
    user.email,
    {
redirectTo:
"https://crowder-app-forms-template-demo-3m5.vercel.app/update-password"
    },
  );

  console.log("ERROR:", error);

  if (error) {
    throw new Error(
      error.message ??
        "Error enviando correo de recuperación",
    );
  }

  redirect(
    `/settings/users/${id}?emailSent=true`,
  );
}
