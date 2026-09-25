import { db } from "@/lib/db";
import { internalUsers } from "@/lib/db/schema";
import { getCurrentUser } from "@/adapters/supabase/server";
import { eq } from "drizzle-orm";

export async function getInternalUser() {
  const authUser = await getCurrentUser();

  if (!authUser?.email) {
    return null;
  }

  return await db.query.internalUsers.findFirst({
    where: eq(
      internalUsers.email,
      authUser.email,
    ),
  });
}