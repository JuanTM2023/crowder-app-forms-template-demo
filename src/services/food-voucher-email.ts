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
  <h1>Food Voucher</h1>

  <p>
    Su voucher ha sido generado correctamente.
  </p>

  <p>
    <strong>Voucher:</strong>
    ${voucherNumber}
  </p>

  <p>
    Puede acceder utilizando el siguiente botón:
  </p>

<p>
  <a
    href="${voucherUrl}"
    style="
      background-color:#2563eb;
      color:#ffffff;
      padding:12px 20px;
      ticketmaster Perú
  </p>
</div>
`,
  });
}