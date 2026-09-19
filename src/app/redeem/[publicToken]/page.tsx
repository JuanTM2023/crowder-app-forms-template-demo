import { db } from "@/lib/db";
import { foodVouchers, foodVoucherLines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export default async function RedeemPage({
  params,
}: {
  params: Promise<{
    publicToken: string;
  }>;
}) {
  const { publicToken } = await params;

  const voucher = await db.query.foodVouchers.findFirst({
    where: eq(foodVouchers.publicToken, publicToken),
  });

  if (!voucher) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Voucher no encontrado</h1>
      </div>
    );
  }

  const qrCode = voucher.qrUrl
    ? await QRCode.toDataURL(voucher.qrUrl)
    : null;

  const lines = await db.query.foodVoucherLines.findMany({
    where: eq(foodVoucherLines.voucherId, voucher.id),
  });

  return (
    <div style={{ padding: 40 }}>
      <h1>VALIDACIÓN DE VOUCHER</h1>

      <p><strong>Voucher:</strong> {voucher.voucherNumber}</p>
      <p><strong>Cliente:</strong> {voucher.customerName}</p>
      <p><strong>Evento:</strong> {voucher.eventName}</p>
      <p><strong>Fecha:</strong> {voucher.show}</p>
      <p><strong>Sector:</strong> {voucher.sectorName}</p>

      {/* Corregido: Renderizado correcto del QR inyectando el string en src */}
      {qrCode && (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="QR Voucher" />
        </div>
      )}

      <p><strong>Estado:</strong> {voucher.status}</p>

      {/* Corregido: Reconstrucción limpia del formulario de envío */}
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
            maxWidth: "500px",
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

      <hr style={{ marginTop: "30px", marginBottom: "20px" }} />

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
