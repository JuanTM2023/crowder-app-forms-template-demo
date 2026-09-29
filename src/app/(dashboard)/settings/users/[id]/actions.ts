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

  const supabase =
    getServiceSupabase();

  const password =
    Math.random()
      .toString(36)
      .slice(-10) + "!";

  await supabase.auth.admin.updateUserById(
    id,
    {
      password,
    },
  );

  console.log(
    "Nueva contraseña:",
    password,
  );

  redirect(
    `/settings/users/${id}?password=${encodeURIComponent(password)}`
);
}
