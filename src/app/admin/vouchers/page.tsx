import { db } from "@/lib/db";
import {
  foodVoucherLines,
  foodVouchers,
  transactions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import AutoRefresh from "./AutoRefresh";
import ExportButton from "./ExportButton";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/adapters/supabase/server";

import { DropdownUserProfile } from "@/components/ui/UserProfile";
import { getInternalUser } from "@/lib/internal-user";

// Componentes del layout visual unificado
import Link from "next/link";
import { RiCloseLine, RiFilterLine } from "@remixicon/react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { EmptyCard } from "@/components/dashboard/EmptyCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";

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
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const internalUser = await getInternalUser();

  if (!internalUser) {
    redirect("/login");
  }

  if (!internalUser.active) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const { query, status, event, show } = resolvedParams;
  const searchNormalized = query?.toLowerCase().trim() || "";

  const vouchers =
    internalUser.role === "ADMIN"
      ? await db.query.foodVouchers.findMany()
      : await db.query.foodVouchers.findMany({
          where: eq(
            foodVouchers.producerCode,
            internalUser.producerCode ?? "",
          ),
        });
     
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

      const transaction = voucher.transactionId
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

      const nombreDelShow = voucher.showName ?? "-";

      return {
        id: voucher.id,
        voucherNumber: voucher.voucherNumber ?? null,
        transactionId: voucher.transactionId ?? null,
        purchaseId: transaction?.purchaseId ?? null,
        quantity,
        price: voucher.price ?? 0,
        serviceFee: voucher.serviceFee ?? 0,
        totalAmount: (voucher.price ?? 0) + (voucher.serviceFee ?? 0),
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
      const matchTransaction = voucher.transactionId?.toLowerCase().includes(searchNormalized);
      const matchPurchase = voucher.purchaseId?.toString().includes(searchNormalized);
      const matchEvent = voucher.eventName?.toLowerCase().includes(searchNormalized);
      const matchShow = voucher.showName?.toLowerCase().includes(searchNormalized);
      
      return matchVoucher || matchCustomer || matchTransaction || matchPurchase || matchEvent || matchShow;
    }

    return true;
  });

  const totalCantidad = filteredVouchers.reduce((acc, voucher) => acc + voucher.quantity, 0);
  const totalPrecio = filteredVouchers.reduce((acc, voucher) => acc + voucher.price, 0);
  const totalServicio = filteredVouchers.reduce((acc, voucher) => acc + voucher.serviceFee, 0);
  const totalGeneral = filteredVouchers.reduce((acc, voucher) => acc + voucher.totalAmount, 0);       

  return (
    <main className="space-y-6 p-6">
      <AutoRefresh />
      
      {/* Encabezado Principal estilizado */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Reporte de Vouchers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
            <span><strong>Usuario:</strong> {internalUser.fullName}</span>
            <span>·</span>
            <span><strong>Rol:</strong> {internalUser.role}</span>
            <span>·</span>
            <span><strong>Productora:</strong> {internalUser.producerCode ?? "TODAS"}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownUserProfile />
          <ExportButton searchParams={resolvedParams} />
        </div>
      </header>

      {/* Caja de Métricas y Totales Informativos */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="p-4 bg-background">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vouchers</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{filteredVouchers.length}</p>
        </Card>
        <Card className="p-4 bg-background">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cantidad total</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{totalCantidad}</p>
        </Card>
        <Card className="p-4 bg-background">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Productos</p>
          <p className="mt-2 text-2xl font-semibold text-foreground font-mono">S/ {totalPrecio.toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-background">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Servicio</p>
          <p className="mt-2 text-2xl font-semibold text-foreground font-mono">S/ {totalServicio.toFixed(2)}</p>
        </Card>
        <Card className="p-4 bg-background border-l-2 border-l-primary">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">Total General</p>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">S/ {totalGeneral.toFixed(2)}</p>
        </Card>
      </div>

      {/* Formulario Unificado de Búsqueda y Filtros */}
      <Card className="bg-background">
        <form className="flex flex-wrap items-center gap-2" method="GET">
          <Input
            type="search"
            name="query"
            defaultValue={query || ""}
            placeholder="Buscar por voucher, cliente, orden..."
            className="w-72"
          />

          <select
            name="event"
            defaultValue={event || "all"}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 maxWidth-[240px]"
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
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 maxWidth-[240px]"
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
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="partial">Parcial</option>
            <option value="redeemed">Canjeado</option>
          </select>

          <Button type="submit" variant="secondary">
            <RiFilterLine className="size-4" aria-hidden="true" /> Filtrar
          </Button>

          {(query || (status && status !== "all") || (event && event !== "all") || (show && show !== "all")) && (
            <Button asChild variant="ghost">
              <Link href="?">
                <RiCloseLine className="size-4" aria-hidden="true" /> Limpiar
              </Link>
            </Button>
          )}
        </form>
      </Card>

      {/* Renderizado Condicional del Listado */}
      {filteredVouchers.length === 0 ? (
        <EmptyCard message="No se encontraron vouchers con los filtros aplicados." />
      ) : (
        <Card className="overflow-hidden bg-background p-0">
          <TableRoot>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Voucher</TableHeaderCell>
                  <TableHeaderCell>Orden ID</TableHeaderCell>
                  <TableHeaderCell>Fecha Creación</TableHeaderCell>
                  <TableHeaderCell>Cliente</TableHeaderCell>
                  <TableHeaderCell>Evento</TableHeaderCell>
                  <TableHeaderCell>Show</TableHeaderCell>
                  <TableHeaderCell>Sector</TableHeaderCell>
                  <TableHeaderCell>Sección</TableHeaderCell>
                  <TableHeaderCell className="text-center">Cant.</TableHeaderCell>
                  <TableHeaderCell className="text-right">Precio</TableHeaderCell>
                  <TableHeaderCell className="text-right">Servicio</TableHeaderCell>
                  <TableHeaderCell className="text-right">Total</TableHeaderCell>
                  <TableHeaderCell>Canjeado por</TableHeaderCell>
                  <TableHeaderCell>Fecha Canje</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                  <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id} hover>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {voucher.voucherNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-secondary-foreground">
                      {voucher.purchaseId != null ? `#${voucher.purchaseId}` : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {voucher.createdAt ? new Date(voucher.createdAt).toLocaleString("es-PE", { timeZone: "America/Lima" }) : "—"}
                    </TableCell>
                    <TableCell className="text-secondary-foreground whitespace-nowrap">
                      {voucher.customerName}
                    </TableCell>
                    <TableCell className="text-secondary-foreground max-w-[200px] truncate">
                      {voucher.eventName}
                    </TableCell>
                    <TableCell className="text-secondary-foreground max-w-[150px] truncate">
                      {voucher.showName}
                    </TableCell>
                    <TableCell className="text-secondary-foreground">
                      {voucher.sectorName}
                    </TableCell>
                    <TableCell className="text-secondary-foreground font-mono text-xs">
                      {voucher.sectionName ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center text-secondary-foreground font-medium">
                      {voucher.quantity}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums text-secondary-foreground">
                      S/ {voucher.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums text-secondary-foreground">
                      S/ {voucher.serviceFee.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums font-semibold text-foreground">
                      S/ {voucher.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-secondary-foreground">
                      {voucher.redeemedBy ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {voucher.redeemedAt ? new Date(voucher.redeemedAt).toLocaleString("es-PE", { timeZone: "America/Lima" }) : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          voucher.calculatedStatus === "redeemed"
                            ? "bg-green-500/10 text-green-400 ring-green-500/20"
                            : voucher.calculatedStatus === "partial"
                              ? "bg-blue-500/10 text-blue-400 ring-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                        }`}
                      >
                        {voucher.calculatedStatus === "redeemed" ? "Canjeado" : voucher.calculatedStatus === "partial" ? "Parcial" : "Pendiente"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/redeem/${voucher.publicToken}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableRoot>
        </Card>
      )}
    </main>
  );
}
