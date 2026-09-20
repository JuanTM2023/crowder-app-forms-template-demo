import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminVouchersPage() {
  const vouchers = await db.query.foodVouchers.findMany();

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "20px", color: "#111827" }}>
        Reporte de Vouchers
      </h1>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Voucher</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Orden ID</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Cliente</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Evento</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Sector</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "#374151" }}>Estado</th>
            </tr>
          </thead>

          <tbody>
            {vouchers.map((voucher) => (
              <tr 
                key={voucher.id} 
                style={{ borderBottom: "1px solid #e5e7eb" }}
              >
                <td style={{ padding: "12px 16px", color: "#1f2937", fontWeight: "500" }}>
                  {voucher.voucherNumber}
                </td>
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                  {voucher.transactionId}
                </td>
                <td style={{ padding: "12px 16px", color: "#1f2937" }}>
                  {voucher.customerName}
                </td>
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                  {voucher.eventName}
                </td>
                <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                  {voucher.sectorName}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: 
                      voucher.status === "redeemed" ? "#def7ec" : 
                      voucher.status === "pending" ? "#fef3c7" : "#e5e7eb",
                    color: 
                      voucher.status === "redeemed" ? "#03543f" : 
                      voucher.status === "pending" ? "#78350f" : "#374151"
                  }}>
                    {voucher.status === "redeemed" ? "Canjeado" : 
                     voucher.status === "pending" ? "Pendiente" : voucher.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
