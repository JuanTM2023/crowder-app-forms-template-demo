import { PDFDocument, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export async function generateVoucherPdf(
  voucher: {
    voucherNumber: string;
    customerName: string | null;
    eventName: string;
    show: string | null;
    sectorName: string | null;
    qrUrl: string | null;
  },
  lines: {
    productName: string;
    quantityPurchased: number;
  }[],
) {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(
    StandardFonts.Helvetica
  );

  let y = 780;

  page.drawText("FOOD VOUCHER", {
    x: 200,
    y,
    size: 22,
    font,
  });

  y -= 40;

  page.drawText(
    `Voucher: ${voucher.voucherNumber}`,
    { x: 50, y, size: 12, font }
  );

  y -= 20;

  page.drawText(
    `Cliente: ${voucher.customerName ?? ""}`,
    { x: 50, y, size: 12, font }
  );

  y -= 20;

  page.drawText(
    `Evento: ${voucher.eventName}`,
    { x: 50, y, size: 12, font }
  );

  y -= 20;

  page.drawText(
    `Fecha: ${voucher.show ?? ""}`,
    { x: 50, y, size: 12, font }
  );

  y -= 20;

  page.drawText(
    `Sector: ${voucher.sectorName ?? ""}`,
    { x: 50, y, size: 12, font }
  );

  y -= 40;

  page.drawText("Productos:", {
    x: 50,
    y,
    size: 14,
    font,
  });

  y -= 20;

  for (const line of lines) {
    page.drawText(
      `${line.quantityPurchased} x ${line.productName}`,
      {
        x: 60,
        y,
        size: 12,
        font,
      }
    );

    y -= 20;
  }

  if (voucher.qrUrl) {
    const qrDataUrl =
      await QRCode.toDataURL(voucher.qrUrl);

    const qrBytes = Buffer.from(
      qrDataUrl.replace(
        /^data:image\/png;base64,/,
        "",
      ),
      "base64",
    );

    const qrImage =
      await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: 200,
      y: 150,
      width: 180,
      height: 180,
    });
  }

  return Buffer.from(
    await pdfDoc.save(),
  );
}