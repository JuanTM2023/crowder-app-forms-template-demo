import { db } from "@/lib/db";
import { foodVouchers, foodVoucherLines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export default async function VoucherPage({
  params,
}: {
  params: Promise<{
    voucherNumber: string;
  }>;
}) {
  const { voucherNumber } = await params;

  const voucher = await db.query.foodVouchers.findFirst({
    where: eq(
      foodVouchers.voucherNumber,
      voucherNumber,
    ),
  });

  const qrCode = voucher?.qrUrl
  ? await QRCode.toDataURL(voucher.qrUrl)
  : null;

  if (!voucher) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Voucher no encontrado</h1>
      </div>
    );
  }

  const lines = await db.query.foodVoucherLines.findMany({
    where: eq(foodVoucherLines.voucherId, voucher.id),
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>FOOD VOUCHER</h1>

      <p>
        <strong>Voucher:</strong>{" "}
        {voucher.voucherNumber}
      </p>

      <p>
        <strong>Cliente:</strong>{" "}
        {voucher.customerName}
      </p>

      <p>
        <strong>Evento:</strong>{" "}
        {voucher.eventName}
      </p>

      <p>
        <strong>Fecha:</strong>{" "}
        {voucher.show}
      </p>

      <p>
        <strong>Sector:</strong>{" "}
        {voucher.sectorName}
      </p>


{qrCode && (
<div
style={{
marginTop: "30px",
marginBottom: "30px",
}}
>  
<img
src={qrCode}
alt="QR Voucher"/>
</div>
)
}


      <p>
        <strong>Estado:</strong>{" "}
        {voucher.status}
      </p>

      <hr />

      <h2>Productos</h2>

      <ul>
        {lines.map((line) => (
          <li key={line.id}>
            {line.quantityPurchased} x{" "}
            {line.productName}
          </li>
        ))}
      </ul>
    </div>
  );
}