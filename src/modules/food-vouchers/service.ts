import { db } from "@/lib/db";

import { foodVouchers, foodVoucherLines } from "@/lib/db/schema";

export async function generateFoodVouchers({
  transactionId,
  context,
  partnerItems,
}: {
  transactionId: string;
  context: {
    eventName: string;
  };
  partnerItems: {
    uuid: string;
    description: string;
    price: number;
  }[];
}) {
  console.log("GENERATING FOOD VOUCHERS", transactionId);

  console.log("PARTNER ITEMS", JSON.stringify(partnerItems, null, 2));

  const [voucher] = await db
    .insert(foodVouchers)
    .values({
      voucherNumber: `PRD-${transactionId}`,

      transactionId,

      partnerItemUuid: partnerItems[0]?.uuid ?? "N/A",

      itemUuid: null,

      customerName: null,

      eventName: context.eventName,

      show: context.eventName,

      sectorName: null,

      sectionName: null,

      productName: partnerItems[0]?.description ?? "PRODUCTO",

      price: partnerItems[0]?.price ?? 0,

      serviceFee: 0,

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
}
