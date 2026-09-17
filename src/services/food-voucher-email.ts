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
<div>
  <h1>Food Voucher</h1>

  <p>
    Su voucher ha sido generado correctamente.
  </p>

  <p>
    Voucher: ${voucherNumber}
  </p>

  <p>
    Ver Voucher:
  </p>

  <p>
    ${voucherUrl}
      ${voucherUrl}
    </a>
  </p>
</div>
`,
  });
}