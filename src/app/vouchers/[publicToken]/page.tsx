import { db } from "@/lib/db";
import { foodVouchers, foodVoucherLines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export default async function VoucherPage({
  params,
}: {
  params: Promise<{
    publicToken: string;
  }>;
}) {
  const { publicToken } = await params;

  // 1. Buscar el voucher en la base de datos
  const voucher = await db.query.foodVouchers.findFirst({
    where: eq(foodVouchers.publicToken, publicToken),
  });

  // 2. Validar inmediatamente si existe (Corregido: movido arriba)
  if (!voucher) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Voucher no encontrado</h1>
      </div>
    );
  }

  // 3. Generar el QR una vez confirmado que el voucher existe
  const qrCode = voucher.qrUrl 
    ? await QRCode.toDataURL(voucher.qrUrl) 
    : null;

  // 4. Buscar las líneas de productos asociadas
  const lines = await db.query.foodVoucherLines.findMany({
    where: eq(foodVoucherLines.voucherId, voucher.id),
  });

  const allRedeemed = lines.every(
  (line) =>
    line.quantityRedeemed >=
    line.quantityPurchased,
);

const partiallyRedeemed = lines.some(
  (line) => line.quantityRedeemed > 0,
);

  return (
    <div style={{ padding: 40 }}>
      <h1>FOOD VOUCHER</h1>

      <p><strong>Voucher:</strong> {voucher.voucherNumber}</p>
      <p><strong>Cliente:</strong> {voucher.customerName}</p>
      <p><strong>Evento:</strong> {voucher.eventName}</p>
      <p><strong>Fecha:</strong> {voucher.showName}</p>
      <p><strong>Sector:</strong> {voucher.sectorName}</p>

      {qrCode && (
        <div style={{ marginTop: "30px", marginBottom: "30px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="QR Voucher" />
        </div>
      )}

    <p>
  <strong>Estado:</strong>{" "}
  {allRedeemed
    ? "✅ Canjeado"
    : partiallyRedeemed
    ? "🟡 Parcial"
    : "⏳ Pendiente"}
</p>


      {voucher.status === "redeemed" && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#16a34a",
            color: "#ffffff",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <strong>✅ Voucher Canjeado</strong>
          <p>
            Fecha:{" "}
            {voucher.redeemedAt
              ? new Date(voucher.redeemedAt).toLocaleString()
              : "-"}
          </p>
          <p>Usuario: {voucher.redeemedBy}</p>
        </div>
      )}

      <hr />

      <h2>Productos</h2>
      <ul>
        {lines.map((line) => (
          <li key={line.id}>
            {line.quantityPurchased} x {line.productName}
          </li>
        ))}
      </ul>
    </div>
  );
}
