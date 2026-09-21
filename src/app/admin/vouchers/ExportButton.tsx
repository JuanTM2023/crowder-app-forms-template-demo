"use client";

import { useTransition } from "react";
import { exportVouchersToExcel } from "./actions";

interface ExportButtonProps {
  searchParams: { query?: string; status?: string; event?: string };
}

export default function ExportButton({ searchParams }: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const fileContent = await exportVouchersToExcel(searchParams);
        
        // Crear el archivo en memoria y forzar la descarga en el navegador
        const blob = new Blob([fileContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.href = url;
        link.setAttribute("download", `Reporte_Vouchers_${new Date().toISOString().split('T')[0]}.xls`);
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
        backgroundColor: "#10b981", // Color verde esmeralda para Excel
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
