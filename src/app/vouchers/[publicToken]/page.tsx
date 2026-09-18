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

  return (
    <div style={{ padding: 40 }}>
      <h1>FOOD VOUCHER</h1>

      <p><strong>Voucher:</strong> {voucher.voucherNumber}</p>
      <p><strong>Cliente:</strong> {voucher.customerName}</p>
      <p><strong>Evento:</strong> {voucher.eventName}</p>
      <p><strong>Fecha:</strong> {voucher.show}</p>
      <p><strong>Sector:</strong> {voucher.sectorName}</p>

      {qrCode && (
        <div style={{ marginTop: "30px", marginBottom: "30px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="QR Voucher" />
        </div>
      )}

      <p><strong>Estado:</strong> {voucher.status}</p>

      {/* Corregido: Se cerró la etiqueta <form> correctamente */}
      {voucher.status === "pending" && (
        <form action={`/api/vouchers/${voucher.publicToken}/redeem`} method="POST">
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            CANJEAR VOUCHER
          </button>
        </form>
      )}

      {voucher.status === "redeemed" && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#dcfce7",
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
