import { db } from "@/lib/db";
// Cambia esto: elimina ", producers" de la importación
import { internalUsers } from "@/lib/db/schema"; 
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateUserAction, 
resetPasswordAction,
} from "./actions";


interface Props {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    emailSent?: string;
  }>;
}

export default async function EditUserPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;

  const { emailSent } =
  await searchParams;


  const user = await db.query.internalUsers.findFirst({
    where: eq(internalUsers.id, id),
  });

  if (!user) {
    notFound();
  }

  const producerList = await db.query.producers.findMany();

  return (
    <main className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Editar Usuario</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Actualiza la información del usuario.
      </p>

      {/* Formulario de actualización de datos */}
      <form action={updateUserAction} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={user.id} />
        
        <input
          name="fullName"
          defaultValue={user.fullName}
          placeholder="Nombre completo"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-black"
        />
        
        <input
          name="email"
          defaultValue={user.email}
          placeholder="Correo"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-black"
        />
        
        <input
          name="documentNumber"
          defaultValue={user.documentNumber}
          placeholder="Documento"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-black"
        />
        
        <input
          name="phone"
          defaultValue={user.phone ?? ""}
          placeholder="Teléfono"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-black"
        />
        
        <select
          name="role"
          defaultValue={user.role}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-black"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SUPERVISOR">SUPERVISOR</option>
          <option value="OPERARIO">OPERARIO</option>
        </select>
        
<select
  name="producerId"
  defaultValue={user.producerId ?? ""}
  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-black"
>
  <option value="">
    Sin Productora
  </option>

  {producerList.map((producer) => (
    <option
      key={producer.id}
      value={producer.id}
    >
      {producer.razon_social}
    </option>
  ))}
</select>
        
        <select
          name="active"
          defaultValue={user.active ? "true" : "false"}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-black"
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 text-white block"
        >
          Guardar Cambios
        </button>
      </form>

      {/* Formulario de seguridad (Restablecer contraseña) */}
      <div className="mt-8 rounded-xl border border-border p-4">
        <h2 className="font-semibold">Seguridad</h2>
        
        <form action={resetPasswordAction} className="mt-4">
          <input type="hidden" name="id" value={user.id} />
          <button
            type="submit"
            className="rounded-xl bg-orange-600 px-4 py-2 text-white"
          >
            Restablecer Contraseña
          </button>

{emailSent && (
  <div className="mt-4 rounded-xl border border-green-500 bg-green-50 p-4">
    <div className="font-semibold text-green-700">
      ✅ Correo enviado correctamente
    </div>

    <div className="mt-2 text-sm text-gray-700">
      Se envió un enlace de recuperación al correo del usuario.
    </div>
  </div>
)}

        </form>
      </div>
    </main>
  );
}