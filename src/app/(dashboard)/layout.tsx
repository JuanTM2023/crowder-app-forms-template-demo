import { Navigation } from "@/components/ui/Navigation";
import { getInternalUser } from "@/lib/internal-user";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const internalUser =
    await getInternalUser();

  return (
    <div>
      <Navigation
        role={internalUser?.role}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {children}
      </div>
    </div>
  );
}