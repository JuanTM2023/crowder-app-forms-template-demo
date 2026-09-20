import { db } from "@/lib/db";
import {
  foodVoucherLines,
  foodVoucherRedemptions,
  foodVouchers,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      lineId: string;
    }>;
  },
) {
  const { lineId } =
    await params;

  const line =
    await db.query.foodVoucherLines.findFirst({
      where: eq(
        foodVoucherLines.id,
        lineId,
      ),
    });

  if (!line) {
    return new Response(
      "Linea no encontrada",
      {
        status: 404,
      },
    );
  }

  await db
    .update(foodVoucherLines)
    .set({
      quantityRedeemed:
        line.quantityRedeemed + 1,
    })
    .where(
      eq(
        foodVoucherLines.id,
        lineId,
      ),
    );
    

  await db
    .insert(
      foodVoucherRedemptions,
    )
    .values({
      voucherId: line.voucherId,
      voucherLineId: line.id,
      quantity: 1,
      redeemedBy: "LOCAL",
    });

    await db
  .update(foodVouchers)
  .set({
    redeemedAt: new Date(),
    redeemedBy: "LOCAL",
  })
  .where(
    eq(
      foodVouchers.id,
      line.voucherId,
    ),
  );

    revalidatePath("/admin/vouchers");

  return Response.redirect(
    request.headers.get(
      "referer",
    ) ?? "/",
  );
}