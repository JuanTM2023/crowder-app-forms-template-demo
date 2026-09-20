import { db } from "@/lib/db";
import { foodVouchers, foodVoucherLines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
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

  const qrCode = voucher.qrUrl ? await QRCode.toDataURL(voucher.qrUrl) : null;

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
      <h1>VALIDACIÓN DE VOUCHER</h1>
      <p><strong>Voucher:</strong> {voucher.voucherNumber}</p>
      <p><strong>Cliente:</strong> {voucher.customerName}</p>
      <p><strong>Evento:</strong> {voucher.eventName}</p>
      <p><strong>Fecha:</strong> {voucher.show}</p>
      <p><strong>Sector:</strong> {voucher.sectorName}</p>

      {qrCode && (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
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
            color: "#FFFFFF",
            borderRadius: "8px",
            marginTop: "20px",
            maxWidth: "500px",
          }}
        >
          <strong>✅ Voucher Canjeado</strong>
          <p>
            Fecha:{" "}
            {voucher.redeemedAt ? new Date(voucher.redeemedAt).toLocaleString() : "-"}
          </p>
          <p>Usuario: {voucher.redeemedBy}</p>
        </div>
      )}

      <hr style={{ marginTop: "30px", marginBottom: "20px" }} />

      <h2>Productos</h2>
      <div>
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              border: "1px solid #374151",
              padding: "12px",
              marginBottom: "12px",
              borderRadius: "8px",
            }}
          >
            <strong>{line.productName}</strong>
            <p>Comprado: {line.quantityPurchased}</p>
            <p>Canjeado: {line.quantityRedeemed}</p>

            {line.quantityRedeemed < line.quantityPurchased && (
              <form action={`/api/vouchers/lines/${line.id}/redeem`} method="POST">
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  ENTREGAR
                </button>
              </form>
            )}

            {line.quantityRedeemed >= line.quantityPurchased && (
              <p>✅ Entregado completamente</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
