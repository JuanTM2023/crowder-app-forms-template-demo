import { db } from "@/lib/db";
import {
  foodVouchers,
  foodVoucherLines,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { generateVoucherPdf } from "@/services/food-voucher-pdf";

export async function GET(
  _request: Request,
  {
    params,
  }: {
params: Promise<{
  publicToken: string;
}>;
  },
) {
  const { publicToken } = await params;

const voucher =
  await db.query.foodVouchers.findFirst({
    where: eq(
      foodVouchers.publicToken,
      publicToken,
    ),
  });

  if (!voucher) {
    return new Response(
      "Voucher no encontrado",
      {
        status: 404,
      },
    );
  }

  const lines =
    await db.query.foodVoucherLines.findMany({
      where: eq(
        foodVoucherLines.voucherId,
        voucher.id,
      ),
    });

  const pdf = await generateVoucherPdf(
    voucher,
    lines,
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        `attachment; filename=${voucher.voucherNumber}.pdf`,
    },
  });
}