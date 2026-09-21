"use client";

import { useTransition } from "react";
import { exportVouchersToExcel } from "./actions";

interface ExportButtonProps {
  searchParams: { query?: string; status?: string; event?: string; show?: string };
}

export default function ExportButton({ searchParams }: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const fileContent = await exportVouchersToExcel(searchParams);
        
        const blob = new Blob([fileContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.href = url;
        link.setAttribute("download", `Reporte_Vouchers_${new Date().toISOString().split('T')}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error al exportar a Excel:", error);
        alert("Hubo un error al generar el reporte.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        backgroundColor: "#10b981",
        color: "#ffffff",
        border: "none",
        fontWeight: "600",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? "Exportando..." : "Exportar a Excel"}
    </button>
  );
}
