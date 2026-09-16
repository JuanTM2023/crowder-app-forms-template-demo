import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export async function sendVoucherEmail({
  email,
  voucherNumber,
  publicToken,
}: {
  email: string;
  voucherNumber: string;
  publicToken: string;
}) {
  const voucherUrl =
    `${process.env.APP_URL}/vouchers/${publicToken}`;

  //const pdfUrl =
  //  `${process.env.APP_URL}/api/vouchers/${publicToken}/pdf`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `Food Voucher ${voucherNumber}`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        "
      >
        <h1>
          Food Voucher
        </h1>

        <p>
          Su voucher ha sido generado correctamente.
        </p>

        <p>
          <strong>Voucher:</strong>
          ${voucherNumber}
        </p>

        <p>
          Puede acceder utilizando los siguientes botones:
        </p>

        <div style="margin-top: 30px;">

          <a
            href="${voucherUrl}"
            style="
              background: #2563eb;
              color: white;
           background: #16a34a;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 6px;        "
        >
          Ticketmaster Perú
        </p>
      </div>
    `,
  });
}