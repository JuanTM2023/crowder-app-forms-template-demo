import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY,
);

export async function sendVoucherEmail({
  email,
  voucherNumber,
}: {
  email: string;
  voucherNumber: string;
}) {
  const voucherUrl =
    `${process.env.APP_URL}/vouchers/${voucherNumber}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `Food Voucher ${voucherNumber}`,

    html: `
      <h1>Food Voucher</h1>

      <p>
        Su voucher ha sido generado correctamente.
      </p>

      <p>
        Voucher:
        <strong>${voucherNumber}</strong>
      </p>

      <p>
        Puede visualizarlo aquí:
      </p>

      ${voucherUrl}
        Ver Voucher
      </a>
    `,
  });
}
