import { db } from "@/lib/db";

import { 
  foodVoucherLines,
} from "@/lib/db/schema";

import { eq } from "drizzle-orm";

import AutoRefresh from "./AutoRefresh";

export const dynamic = "force-dynamic";

export default async function AdminVouchersPage() {
const vouchers =
  await db.query.foodVouchers.findMany();

const vouchersWithStatus =
  await Promise.all(
    vouchers.map(async (voucher) => {

      const lines =
        await db.query.foodVoucherLines.findMany({
          where: eq(
            foodVoucherLines.voucherId,
            voucher.id,
          ),
        });

      const allRedeemed =
        lines.length > 0 &&
        lines.every(
          (line) =>
            line.quantityRedeemed >=
            line.quantityPurchased,
        );

      const partiallyRedeemed =
        lines.some(
          (line) =>
            line.quantityRedeemed > 0,
        );

      let calculatedStatus =
        "pending";

      if (allRedeemed) {
        calculatedStatus =
          "redeemed";
      } else if (
        partiallyRedeemed
      ) {
        calculatedStatus =
          "partial";
      }

      return {
        ...voucher,
        calculatedStatus,
      };
    }),
  );

    return (
  <div
    style={{
      padding: 40,
      fontFamily: "sans-serif",
      backgroundColor: "#111827",
      minHeight: "100vh",
    }}
  >
    <AutoRefresh />
      <h1 style={{ marginBottom: "20px", color: "#ffffff" }}>
        Reporte de Vouchers
      </h1>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            {/* Corregido: Se agregaron todos los encabezados correspondientes para que coincidan con las columnas del body */}
            <tr style={{ backgroundColor: "#1f2937", borderBottom: "2px solid #374151" }}>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Voucher</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Orden ID</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Fecha Creación</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Cliente</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Evento</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Sector</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Zona</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Canjeado Por</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Fecha Canje</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Estado</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
           {vouchersWithStatus.map((voucher) => (
              <tr 
                key={voucher.id} 
                style={{ borderBottom: "1px solid #374151" }}
              >
                <td style={{ padding: "12px 16px", color: "#fdfdfd", fontWeight: "500" }}>
                  {voucher.voucherNumber}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.transactionId}
                </td>
                {/* Corregido: Se aplicó padding y color consistente */}
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.createdAt
  ? new Date(voucher.createdAt).toLocaleString(
      "es-PE",
      {
        timeZone: "America/Lima",
      },
    )
  : "-"}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.customerName}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.eventName}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.sectorName}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.sectionName}
                </td>
                {/* Corregido: Se aplicó padding y color consistente */}
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.redeemedBy ?? "-"}
                </td>
                {/* Corregido: Se aplicó padding y color consistente */}
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.redeemedAt
  ? new Date(voucher.redeemedAt).toLocaleString(
      "es-PE",
      {
        timeZone: "America/Lima",
      },
    )
  : "-"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                   backgroundColor:
  voucher.calculatedStatus === "redeemed"
    ? "#def7ec"
    : voucher.calculatedStatus === "partial"
    ? "#dbeafe"
    : "#fef3c7",
color:
  voucher.calculatedStatus === "redeemed"
    ? "#03543f"
    : voucher.calculatedStatus === "partial"
    ? "#1e40af"
    : "#78350f"
                  }}>
{voucher.calculatedStatus === "redeemed"
  ? "Canjeado"
  : voucher.calculatedStatus === "partial"
  ? "Parcial"
  : "Pendiente"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {/* Corregido: Se añadió la propiedad href correcta y estilos al link */}
                  <a 
                    href={`/redeem/${voucher.publicToken}`} 
                    style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}
                  >
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
