"use server";

import { db } from "@/lib/db";
import { foodVoucherLines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function exportVouchersToExcel(searchParams: { query?: string; status?: string; event?: string }) {
  const searchNormalized = searchParams.query?.toLowerCase().trim() || "";
  const { status, event } = searchParams;

  // 1. Obtener los datos base
  const vouchers = await db.query.foodVouchers.findMany();

  // 2. Calcular los estados en tiempo real
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

  // 3. Aplicar los mismos filtros que en la vista web
  const filteredVouchers = vouchersWithStatus.filter((voucher) => {
    if (status && status !== "all" && voucher.calculatedStatus !== status) return false;
    if (event && event !== "all" && voucher.eventName !== event) return false;

    if (searchNormalized) {
      const matchVoucher = voucher.voucherNumber?.toLowerCase().includes(searchNormalized);
      const matchCustomer = voucher.customerName?.toLowerCase().includes(searchNormalized);
      const matchTransaction = voucher.transactionId?.toLowerCase().includes(searchNormalized);
      const matchEvent = voucher.eventName?.toLowerCase().includes(searchNormalized);
      return matchVoucher || matchCustomer || matchTransaction || matchEvent;
    }
    return true;
  });

  // 4. Mapear los nombres de los estados
  const getStatusText = (status: string) => {
    if (status === "redeemed") return "Canjeado";
    if (status === "partial") return "Parcial";
    return "Pendiente";
  };

  // 5. Construir un archivo CSV/TSV compatible nativamente con Excel usando delimitador de tabulación y BOM UTF-8
  const headers = ["Voucher", "Orden ID", "Cliente", "Evento", "Sector", "Estado", "Entregado por", "Fecha entrega"];
  
  const rows = filteredVouchers.map((voucher) => {
    const fechaEntrega = voucher.redeemedAt
      ? new Date(voucher.redeemedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })
      : "-";

    return [
      voucher.voucherNumber ?? "-",
      voucher.transactionId ?? "-",
      voucher.customerName ?? "-",
      voucher.eventName ?? "-",
      voucher.sectorName ?? "-",
      getStatusText(voucher.calculatedStatus),
      voucher.redeemedBy ?? "-",
      fechaEntrega
    ];
  });

  // Formato TSV (Tab-Separated Values) con codificación especial para Excel
  const CSV_BOM = "\uFEFF";
  const content = [
    headers.join("\t"),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join("\t"))
  ].join("\n");

  return CSV_BOM + content;
}
