"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { internalUsers } from "@/lib/db/schema";
import { getServiceSupabase } from "@/adapters/supabase/server";

export async function createUserAction(
  formData: FormData,
) {

  const supabase =
  getServiceSupabase();

const email =
  formData.get("email") as string;

const password =
  formData.get("password") as string;

const role =
  formData.get("role") as string;

const producerId =
  (formData.get("producerId") as string) || null;  

if (
  role !== "ADMIN" &&
  !producerId
) {
  throw new Error(
    "Debe seleccionar una productora para este usuario",
  );
}
  

const { data, error } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });  

if (error) {
  throw new Error(error.message);
}

if (!data.user) {
  throw new Error("No se pudo crear el usuario en Authentication");
}


  await db.insert(internalUsers).values({
    id: data.user.id,
    fullName:
      formData.get("fullName") as string,

    documentType:
      formData.get("documentType") as string,

    documentNumber:
      formData.get("documentNumber") as string,

    email:
      formData.get("email") as string,

    phone:
      (formData.get("phone") as string) || null,

    birthDate:
      formData.get("birthDate")
        ? new Date(
            formData.get("birthDate") as string,
          )
        : null,

    role:
      formData.get("role") as string,

    producerId:
      (formData.get("producerId") as string) || null,

    active: true,
  });

  redirect("/settings/users");
}