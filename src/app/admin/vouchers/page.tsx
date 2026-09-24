import { db } from "@/lib/db";
import {
foodVoucherLines,
  transactions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import AutoRefresh from "./AutoRefresh";
import ExportButton from "./ExportButton";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ query?: string; status?: string; event?: string; show?: string }>;
}

interface WebExtendedVoucher {
  id: string;
  voucherNumber: string | null;
  transactionId: string | null;
  purchaseId: number | null;
  createdAt: Date | null;
  customerName: string | null;
  eventName: string | null;
  showName: string | null;
  sectorName: string | null;
  sectionName: string | null;
  redeemedBy: string | null;
  redeemedAt: Date | null;
  publicToken: string | null;
  calculatedStatus: string;

  quantity: number;
price: number;
serviceFee: number;
totalAmount: number;
}

export default async function AdminVouchersPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const { query, status, event, show } = resolvedParams;
  const searchNormalized = query?.toLowerCase().trim() || "";

  const vouchers = await db.query.foodVouchers.findMany();
  
  const uniqueEvents = Array.from(
    new Set(
      vouchers
        .map((v) => v.eventName)
        .filter((name): name is string => typeof name === "string" && name.trim() !== "")
    )
  ).sort();

const uniqueShows = Array.from(
  new Set(
    vouchers
      .filter(
        (v) =>
          !event ||
          event === "all" ||
          v.eventName === event
      )
      .map((v) => v.showName)
      .filter(
        (show): show is string =>
          !!show &&
          show.trim() !== ""
      )
  )
).sort();

  const vouchersWithStatus: WebExtendedVoucher[] = await Promise.all(
    vouchers.map(async (voucher) => {
      const lines = await db.query.foodVoucherLines.findMany({
        where: eq(foodVoucherLines.voucherId, voucher.id),
      });

      const transaction =
  voucher.transactionId
    ? await db.query.transactions.findFirst({
        where: eq(
          transactions.id,
          voucher.transactionId,
        ),
      })
    : null;

    const quantity = lines.reduce(
  (acc, line) => acc + line.quantityPurchased,
  0,
);

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



const nombreDelShow =
  voucher.showName ?? "-";

      return {
        id: voucher.id,
        voucherNumber: voucher.voucherNumber ?? null,
        transactionId: voucher.transactionId ?? null,
        purchaseId: transaction?.purchaseId ?? null,
        quantity,

price: voucher.price ?? 0,

serviceFee: voucher.serviceFee ?? 0,

totalAmount:
  (voucher.price ?? 0) +
  (voucher.serviceFee ?? 0),
        createdAt: voucher.createdAt ?? null,
        customerName: voucher.customerName ?? null,
        eventName: voucher.eventName ?? null,
        showName: nombreDelShow,
        sectorName: voucher.sectorName ?? null,
        sectionName: voucher.sectionName ?? null,
        redeemedBy: voucher.redeemedBy ?? null,
        redeemedAt: voucher.redeemedAt ?? null,
        publicToken: voucher.publicToken ?? null,
        calculatedStatus,
      };
    }),
  );

  const filteredVouchers = vouchersWithStatus.filter((voucher) => {
    if (status && status !== "all" && voucher.calculatedStatus !== status) return false;
    if (event && event !== "all" && voucher.eventName !== event) return false;
    if (show && show !== "all" && voucher.showName !== show) return false;

    if (searchNormalized) {
      const matchVoucher = voucher.voucherNumber?.toLowerCase().includes(searchNormalized);
      const matchCustomer = voucher.customerName?.toLowerCase().includes(searchNormalized);
      const matchTransaction =
  voucher.transactionId
    ?.toLowerCase()
    .includes(searchNormalized);

const matchPurchase =
  voucher.purchaseId
    ?.toString()
    .includes(searchNormalized);
      const matchEvent = voucher.eventName?.toLowerCase().includes(searchNormalized);
      const matchShow = voucher.showName?.toLowerCase().includes(searchNormalized);


      
      return matchVoucher ||
       matchCustomer ||
       matchTransaction ||
       matchPurchase ||
       matchEvent ||
       matchShow;
    }

    return true;
  });

 const totalCantidad = filteredVouchers.reduce(
  (acc, voucher) => acc + voucher.quantity,
  0,
);

const totalPrecio = filteredVouchers.reduce(
  (acc, voucher) => acc + voucher.price,
  0,
);

const totalServicio = filteredVouchers.reduce(
  (acc, voucher) => acc + voucher.serviceFee,
  0,
);

const totalGeneral = filteredVouchers.reduce(
  (acc, voucher) => acc + voucher.totalAmount,
  0,
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
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <h1 style={{ margin: 0, color: "#ffffff" }}>
          Reporte de Vouchers
        </h1>
        <ExportButton searchParams={resolvedParams} />
      </div>

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
          name="event"
          defaultValue={event || "all"}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            maxWidth: "240px",
          }}
        >
          <option value="all">Todos los eventos</option>
          {uniqueEvents.map((eventName) => (
            <option key={eventName} value={eventName}>
              {eventName}
            </option>
          ))}
        </select>

        <select
          name="show"
          defaultValue={show || "all"}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            maxWidth: "240px",
          }}
        >
          <option value="all">Todos los shows</option>
          {uniqueShows.map((showName) => (
            <option key={showName} value={showName}>
              {showName}
            </option>
          ))}
        </select>

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

        {(query || (status && status !== "all") || (event && event !== "all") || (show && show !== "all")) && (
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

      <div
  style={{
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#1f2937",
    borderRadius: "8px",
    color: "#ffffff",
  }}
>
  <div>
    Vouchers: {filteredVouchers.length}
  </div>

  <div>
    Cantidad: {totalCantidad}
  </div>

  <div>
    Productos: S/ {totalPrecio.toFixed(2)}
  </div>

  <div>
    Servicio: S/ {totalServicio.toFixed(2)}
  </div>

  <div>
    Total General: S/ {totalGeneral.toFixed(2)}
  </div>
</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#1f2937", borderBottom: "2px solid #374151" }}>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Voucher</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Orden ID</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Fecha Creación</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Cliente</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Evento</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Show</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Sector</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Sección</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Cantidad</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Precio</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Servicio</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Total</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Canjeado Por</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Fecha Canje</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Estado</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#9b9b9b" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.map((voucher) => (
              <tr key={voucher.id} style={{ borderBottom: "1px solid #374151" }}>
                <td style={{ padding: "12px 16px", color: "#fdfdfd", fontWeight: "500" }}>{voucher.voucherNumber}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}> {voucher.purchaseId ?? "-"}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.createdAt ? new Date(voucher.createdAt).toLocaleString("es-PE", { timeZone: "America/Lima" }) : "-"}
                </td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>{voucher.customerName}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>{voucher.eventName}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>{voucher.showName}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>{voucher.sectorName}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>{voucher.sectionName ?? "-"}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>{voucher.quantity}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>S/ {voucher.price.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>S/ {voucher.serviceFee.toFixed(2)}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>S/ {voucher.totalAmount.toFixed(2)}</td>                                                                
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>{voucher.redeemedBy ?? "-"}</td>
                <td style={{ padding: "12px 16px", color: "#ffffff" }}>
                  {voucher.redeemedAt ? new Date(voucher.redeemedAt).toLocaleString("es-PE", { timeZone: "America/Lima" }) : "-"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      backgroundColor: voucher.calculatedStatus === "redeemed" ? "#def7ec" : voucher.calculatedStatus === "partial" ? "#dbeafe" : "#fef3c7",
                      color: voucher.calculatedStatus === "redeemed" ? "#03543f" : voucher.calculatedStatus === "partial" ? "#1e40af" : "#78350f",
                    }}
                  >
                    {voucher.calculatedStatus === "redeemed" ? "Canjeado" : voucher.calculatedStatus === "partial" ? "Parcial" : "Pendiente"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <a href={`/redeem/${voucher.publicToken}`} style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>Ver</a>
                </td>
              </tr>
            ))}
            {filteredVouchers.length === 0 && (
              <tr>
                <td colSpan={16} style={{ padding: "24px", color: "#9ca3af", textAlign: "center" }}>
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
