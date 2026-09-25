import { db } from "@/lib/db";
import { internalUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/adapters/supabase/server";

export async function getInternalUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return db.query.internalUsers.findFirst({
    where: eq(
      internalUsers.email,
      user.email ?? "",
    ),
  });
}