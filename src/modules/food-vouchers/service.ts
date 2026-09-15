import { db } from "@/lib/db";

import { foodVouchers, foodVoucherLines } from "@/lib/db/schema";

import { desc } from "drizzle-orm";

import { sendVoucherEmail } from "@/services/food-voucher-email";

export async function generateFoodVouchers({
  transactionId,
  context,
  items,
  partnerItems,
}: {
  transactionId: string;
  context: {
    eventName: string;
    user?: {
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  };

  items: {
    show?: string | null;
    sectorName: string;
    sectionName?: string | null;
    row?: string | null;
    seat?: string | null;
  }[];
  partnerItems: {
    uuid: string;
    description: string;
    price: number;
  }[];
}) {
  console.log("GENERATING FOOD VOUCHERS", transactionId);

  console.log("PARTNER ITEMS", JSON.stringify(partnerItems, null, 2));

  const firstItem = items[0];

  const showDisplay = firstItem?.show
    ? new Intl.DateTimeFormat("es-PE", {
        timeZone: "America/Lima",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(firstItem.show))
    : null;

  console.log("FIRST ITEM", JSON.stringify(firstItem, null, 2));

  const customerName =
    [context.user?.firstName, context.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || null;

  const customerEmail =
context.user?.email ?? null;    

  const lastVoucher = await db
    .select()
    .from(foodVouchers)
    .orderBy(desc(foodVouchers.createdAt))
    .limit(1);

  const lastNumber = lastVoucher[0]?.voucherNumber?.split("-")?.at(-1);

  const year = new Date().getFullYear();

  const nextSequence = (Number(lastNumber) || 0) + 1;

  const voucherNumber = `ALM-${year}-${String(nextSequence).padStart(6, "0")}`;

console.log("APP URL =", process.env.APP_URL);

  const qrUrl =
  `${process.env.APP_URL}/vouchers/${voucherNumber}`;


  const [voucher] = await db
    .insert(foodVouchers)
    .values({
      voucherNumber: voucherNumber,

      transactionId,

      partnerItemUuid: partnerItems[0]?.uuid ?? "N/A",

      itemUuid: null,

      customerName: customerName,

      customerEmail: customerEmail,

      eventName: context.eventName,

      show: showDisplay,

      sectorName: firstItem?.sectorName ?? null,

      sectionName: firstItem?.sectionName ?? firstItem?.row ?? null,

      productName: partnerItems[0]?.description ?? "PRODUCTO",

      price: partnerItems[0]?.price ?? 0,

      serviceFee: 0,

      qrUrl: qrUrl,

      status: "pending",
    })
    .returning();

  const grouped = new Map<string, { productName: string; quantity: number }>();

  for (const item of partnerItems) {
    // ignorar la línea de cargo por servicio
    if (item.description === "Cargo por servicio") {
      continue;
    }

    const current = grouped.get(item.description);

    if (current) {
      current.quantity++;
    } else {
      grouped.set(item.description, {
        productName: item.description,
        quantity: 1,
      });
    }
  }

  await db.insert(foodVoucherLines).values(
    Array.from(grouped.values()).map((row) => ({
      voucherId: voucher.id,

      productName: row.productName,

      quantityPurchased: row.quantity,

      quantityRedeemed: 0,
    })),
  );

  if (
  customerEmail
) {
  await sendVoucherEmail({
    email: customerEmail,
    voucherNumber:
      voucher.voucherNumber,
  });
}
}
