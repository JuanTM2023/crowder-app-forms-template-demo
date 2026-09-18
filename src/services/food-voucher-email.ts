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
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Food Voucher</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
          <!-- Tabla Contenedora Principal -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f3f4f6" style="table-layout: fixed;">
              <tr>
                  <td align="center" style="padding: 40px 10px;">
                      <!-- Caja de Contenido -->
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                          <tr>
                              <td style="padding: 40px 30px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #1f2937;">
                                  
                                  <h1 style="margin-top: 0; margin-bottom: 20px; font-size: 24px; color: #111827; font-weight: bold;">Food Voucher</h1>
                                  
                                  <p style="margin-top: 0; margin-bottom: 16px;">Su voucher ha sido generado correctamente.</p>
                                  
                                  <p style="margin-top: 0; margin-bottom: 24px;">
                                      <strong style="color: #111827;">Voucher:</strong> ${voucherNumber}
                                  </p>
                                  
                                  <p style="margin-top: 0; margin-bottom: 20px;">Puede acceder a su voucher utilizando los siguientes botones:</p>
                                  
                                  <!-- Contenedor de Botones en Bloque (Compatibilidad total) -->
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                      <tr>
                                          <td>
                                              <!-- Botón 1: Ver en la Web -->
                                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="left" style="margin-bottom: 15px; margin-right: 15px;">
                                                  <tr>
                                                      <td bgcolor="#2563eb" style="border-radius: 6px; text-align: center;">
                                                          <a href="${voucherUrl}" target="_blank" style="background-color: #2563eb; border: 1px solid #2563eb; border-radius: 6px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; line-height: 1; padding: 12px 24px; text-decoration: none; text-align: center;">
                                                              Ver en Web
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>

                                              <!-- Botón 2: Descargar PDF directamente -->
                                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="left" style="margin-bottom: 15px;">
                                                  <tr>
                                                      <td bgcolor="#059669" style="border-radius: 6px; text-align: center;">
                                                          <a href="${pdfUrl}" target="_blank" style="background-color: #059669; border: 1px solid #059669; border-radius: 6px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; line-height: 1; padding: 12px 24px; text-decoration: none; text-align: center;">
                                                              Descargar PDF
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                                  
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `,
  });
}
