import { db } from "@/lib/db";
import { foodVoucherLines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import AutoRefresh from "./AutoRefresh";
//import Form from "next/form"; // Disponible en Next.js 15 para búsquedas nativas sin JS, o puedes usar un formulario estándar

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ query?: string; status?: string }>;
}

export default async function AdminVouchersPage({ searchParams }: Props) {
  // 1. Desestructurar los parámetros de búsqueda de la URL
  const { query, status } = await searchParams;
  const searchNormalized = query?.toLowerCase().trim() || "";

  // 2. Obtener los datos base de la base de datos
  const vouchers = await db.query.foodVouchers.findMany();
  
  const vouchersWithStatus = await Promise.all(
    vouchers.map(async (voucher) => {
      const lines = await db.query.foodVoucherLines.findMany({
        where: eq(foodVoucherLines.voucherId, voucher.id),
      });

      const allRedeemed =
        lines.length > 0 &&
        lines.every((line) => line.quantityRedeemed >= line.quantityPurchased);
        
      const partiallyRedeemed = lines.some((line) => line.quantityRedeemed > 0);

      let calculatedStatus = "pending";
      if (allRedeemed) {
        calculatedStatus = "redeemed";
      } else if (partiallyRedeemed) {
        calculatedStatus = "partial";
      }

      return {
        ...voucher,
        calculatedStatus,
      };
    }),
  );

  // 3. Aplicar los filtros en memoria
  const filteredVouchers = vouchersWithStatus.filter((voucher) => {
    // Filtro por Estado
    if (status && status !== "all" && voucher.calculatedStatus !== status) {
      return false;
    }

    // Filtro por Texto (Voucher, Cliente, Orden ID, Evento)
    if (searchNormalized) {
      const matchVoucher = voucher.voucherNumber?.toLowerCase().includes(searchNormalized);
      const matchCustomer = voucher.customerName?.toLowerCase().includes(searchNormalized);
      const matchTransaction = voucher.transactionId?.toLowerCase().includes(searchNormalized);
      const matchEvent = voucher.eventName?.toLowerCase().includes(searchNormalized);
      
      return matchVoucher || matchCustomer || matchTransaction || matchEvent;
    }

    return true;
  });

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

      {/* barra de filtros mediante un formulario GET nativo */}
      <form
        method="GET"
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          name="query"
          placeholder="Buscar por voucher, cliente, orden..."
          defaultValue={query || ""}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            minWidth: "280px",
          }}
        />

        <select
          name="status"
          defaultValue={status || "all"}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#1f2937",
            color: "#ffffff",
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="partial">Parcial</option>
          <option value="redeemed">Canjeado</option>
        </select>

        <button
          type="submit"
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Filtrar
        </button>

        {(query || (status && status !== "all")) && (
          <a
            href="?"
            style={{
              color: "#9ca3af",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Limpiar filtros
          </a>
        )}
      </form>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
        >
          <thead>
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
            {filteredVouchers.map((voucher) => (
              <tr key={voucher.id} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "12px 16px", color: "#fdfdfd", fontWeight: "500" }}>
                  {voucher.voucherNumber}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.transactionId}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.createdAt
                    ? new Date(voucher.createdAt).toLocaleString("es-PE", {
                        timeZone: "America/Lima",
                      })
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
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.redeemedBy ?? "-"}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.redeemedAt
                    ? new Date(voucher.redeemedAt).toLocaleString("es-PE", {
                        timeZone: "America/Lima",
                      })
                    : "-"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
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
                          : "#78350f",
                    }}
                  >
                    {voucher.calculatedStatus === "redeemed"
                      ? "Canjeado"
                      : voucher.calculatedStatus === "partial"
                      ? "Parcial"
                      : "Pendiente"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <a
                    href={`/redeem/${voucher.publicToken}`}
                    style={{
                      color: "#3b82f6",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    Ver
                  </a>
                </td>
              </tr>
            ))}
            {filteredVouchers.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: "24px", color: "#9ca3af", textAlign: "center" }}>
                  No se encontraron vouchers con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
