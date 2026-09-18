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

        <table cellpadding="0" cellspacing="0" border="0">
          <tr>

            <td>
              ${voucherUrl}
                Ver Voucher
              </a>
            </td>

            <td width="15"></td>

            <td>
              <a
                href="${pdfUrl}"
                style="
                  background-color:#16a34a;
                  color:#ffffff;
                  text- <p style="font-size:12px;color:#666;">
          Ticketmaster Perú
        </p>

      </div>
    `,
  });
}