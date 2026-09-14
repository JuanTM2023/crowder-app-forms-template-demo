import { db } from "@/lib/db";
import { foodVouchers } from "@/lib/db/schema";

export async function generateFoodVouchers(transactionId: string) {
  console.log("GENERATING FOOD VOUCHERS", transactionId);

  await db.insert(foodVouchers).values({
    voucherNumber: `TEST-${transactionId}`,

    transactionId,

    partnerItemUuid: "TEMP",

    itemUuid: null,

    customerName: "TEST",

    eventName: "TEST EVENT",

    show: "TEST SHOW",

    sectorName: "TEST SECTOR",

    sectionName: "TEST SECTION",

    productName: "TEST PRODUCT",

    price: 0,

    serviceFee: 0,

    status: "pending",
  });
}
