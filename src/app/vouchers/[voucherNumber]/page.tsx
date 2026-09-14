export default async function VoucherPage({
  params,
}: {
  params: Promise<{
    voucherNumber: string;
  }>;
}) {
  const { voucherNumber } = await params;

  return (
    <div style={{ padding: "40px" }}>
      <h1>FOOD VOUCHER</h1>

      <p>
        Voucher: {voucherNumber}
      </p>
    </div>
  );
}