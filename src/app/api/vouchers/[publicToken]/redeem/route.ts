import { db } from "@/lib/db";
import { foodVouchers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function POST(
  _request: Request, // Ignora el chequeo de variable no usada
  {
    params,
  }: {
    params: Promise<{
      publicToken: string;
    }>;
  }
) {
  // 1. Resolver los parámetros asíncronos de Next.js 15
  const { publicToken } = await params;

  // 2. Buscar el voucher en la base de datos
  const voucher = await db.query.foodVouchers.findFirst({
    where: eq(foodVouchers.publicToken, publicToken),
  });

  // 3. Validar si el voucher existe
  if (!voucher) {
    return new Response("Voucher no encontrado", {
      status: 404,
    });
  }

  // 4. Si ya fue canjeado, redirigir inmediatamente a la página del voucher
  if (voucher.status === "redeemed") {
    redirect(`/vouchers/${publicToken}`);
  }

  // 5. Actualizar el estado del voucher a 'redeemed'
const redeemedBy = "LOCAL";

await db
  .update(foodVouchers)
  .set({
    status: "redeemed",
    redeemedAt: new Date(),
    redeemedBy,
  })
  
    .where(eq(foodVouchers.id, voucher.id));

  // 6. Redirigir a la página del voucher tras el canje exitoso
  redirect(`/vouchers/${publicToken}`);
}
