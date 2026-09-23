"use server";

import { db } from "@/lib/db";
import { foodVoucherLines, 
  transactions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";


interface ExtendedVoucher {
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
  resumenProductos: string;
}

export async function exportVouchersToExcel(searchParams: { query?: string; status?: string; event?: string; show?: string }) {
  const searchNormalized = searchParams.query?.toLowerCase().trim() || "";
  const { status, event, show } = searchParams;

  const vouchers = await db.query.foodVouchers.findMany();

  const vouchersWithStatus: ExtendedVoucher[] = await Promise.all(
    vouchers.map(async (voucher) => {
      const lines = await db.query.foodVoucherLines.findMany({
        where: eq(foodVoucherLines.voucherId, voucher.id),
      });

      const resumenProductos = lines
        .map((line) => {
          const cantidad = line.quantityPurchased ?? 0;
          const nombreProducto = line.productName ?? "Producto"; 
          return `${cantidad} ${nombreProducto}`;
        })
        .join(", ");

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

      // Validación segura y tipada en TypeScript para extraer dinámicamente propiedades alternativas sin 'any'
      const raw = voucher as unknown as Record<string, unknown>;
      let nombreDelShow = "-";

      if (typeof raw.showName === "string") {
        nombreDelShow = raw.showName;
      } else if (raw.show && typeof raw.show === "object" && "name" in raw.show && typeof (raw.show as Record<string, unknown>).name === "string") {
        nombreDelShow = (raw.show as Record<string, string>).name;
      } else if (typeof raw.show_name === "string") {
        nombreDelShow = raw.show_name;
      }

      const transaction =
  voucher.transactionId
    ? await db.query.transactions.findFirst({
        where: eq(
          transactions.id,
          voucher.transactionId,
        ),
      })
    : null;

      return {
        id: voucher.id,
        voucherNumber: voucher.voucherNumber ?? null,
        transactionId: voucher.transactionId ?? null,
        purchaseId: transaction?.purchaseId ?? null,
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
        resumenProductos: resumenProductos || "-",
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
      const matchTransaction = voucher.transactionId?.toLowerCase().includes(searchNormalized);
      const matchEvent = voucher.eventName?.toLowerCase().includes(searchNormalized);
      const matchShow = voucher.showName?.toLowerCase().includes(searchNormalized);
      return matchVoucher || matchCustomer || matchTransaction || matchEvent || matchShow;
    }
    return true;
  });

  const getStatusText = (status: string) => {
    if (status === "redeemed") return "Canjeado";
    if (status === "partial") return "Parcial";
    return "Pendiente";
  };

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://w3.org">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    </head>
    <body>
      <table border="1">
        <thead>
          <tr style="background-color: #1f2937; color: #ffffff; font-weight: bold;">
            <th>Voucher</th>
            <th>Orden ID</th>
            <th>Cliente</th>
            <th>Evento</th>
            <th>Show</th>
            <th>Sector</th>
            <th>Sección</th>
            <th>Resumen</th>
            <th>Estado</th>
            <th>Entregado por</th>
            <th>Fecha entrega</th>
          </tr>
        </thead>
        <tbody>
  `;

  filteredVouchers.forEach((voucher) => {
    const fechaEntrega = voucher.redeemedAt
      ? new Date(voucher.redeemedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })
      : "-";

    html += `
      <tr>
        <td>${voucher.voucherNumber ?? "-"}</td>
        <td>${voucher.purchaseId ?? "-"}</td>
        <td>${voucher.customerName ?? "-"}</td>
        <td>${voucher.eventName ?? "-"}</td>
        <td>${voucher.showName}</td>
        <td>${voucher.sectorName ?? "-"}</td>
        <td>${voucher.sectionName ?? "-"}</td>
        <td>${voucher.resumenProductos}</td>
        <td>${getStatusText(voucher.calculatedStatus)}</td>
        <td>${voucher.redeemedBy ?? "-"}</td>
        <td>${fechaEntrega}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  return html;
}
