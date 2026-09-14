import { db } from "@/lib/db";
import { foodVouchers } from "@/lib/db/schema";

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

  await db.insert(foodVouchers).values({
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
  });
}
