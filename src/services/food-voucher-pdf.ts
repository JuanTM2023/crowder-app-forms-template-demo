import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export async function generateVoucherPdf(voucher: {
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
}[],) {
  return new Promise<Buffer>(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    doc.fontSize(22);
    doc.text("FOOD VOUCHER", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12);

    doc.text(`Voucher: ${voucher.voucherNumber}`);
    doc.text(`Cliente: ${voucher.customerName}`);
    doc.text(`Evento: ${voucher.eventName}`);
    doc.text(`Fecha: ${voucher.show}`);
    doc.text(`Sector: ${voucher.sectorName}`);

    doc.moveDown();

    doc.text("Productos:");

    lines.forEach((line) => {
      doc.text(
        `${line.quantityPurchased} x ${line.productName}`
      );
    });

    doc.moveDown();

if (!voucher.qrUrl) {
  throw new Error(
    `Voucher ${voucher.voucherNumber} no tiene qrUrl`
  );
}

const qrDataUrl = await QRCode.toDataURL(
  voucher.qrUrl
);

    const qrBuffer = Buffer.from(
      qrDataUrl.replace(
        /^data:image\/png;base64,/,
        ""
      ),
      "base64"
    );

    doc.image(qrBuffer, {
      fit: [180, 180],
      align: "center",
    });

    doc.moveDown();

    doc.text(
      "Presente este voucher para realizar el canje",
      {
        align: "center",
      }
    );

    doc.end();
  });
}