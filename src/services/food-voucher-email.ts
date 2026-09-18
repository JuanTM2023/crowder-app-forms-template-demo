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

  const pdfUrl =
    `${process.env.APP_URL}/api/vouchers/${publicToken}/pdf`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `Food Voucher ${voucherNumber}`,

    html: `
      <div style="font-family: Arial, sans-serif; padding:20px;">

        <h1>Food Voucher</h1>

        <p>
          Su voucher ha sido generado correctamente.
        </p>

        <p>
          <strong>Voucher:</strong> ${voucherNumber}
        </p>

        <p>
          Puede acceder a su voucher utilizando los siguientes botones:
        </p>

 <table role="presentation" cellspacing="0" cellpadding="0" border="0">
  <tr>

    <td
      bgcolor="#2563eb"
      style="
        border-radius:6px;
        text-align:center;
      "
    >
      <a
        href="${voucherUrl}"
        style="
          display:inline-block;
          padding:12px 24px;
          color:#ffffff;
          font-weight:bold;
          text-ter;
      "
    >
      ${pdfUrl}
        Descargar PDF
      </a>
    </td>

  </tr>
</table>
`,
  });
}