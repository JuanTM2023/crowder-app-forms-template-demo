"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage(
        "Las contraseñas no coinciden",
      );
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "✅ Contraseña actualizada correctamente",
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-3xl font-bold">
        Cambiar contraseña
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Ingresa una nueva contraseña para tu cuenta.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full rounded-xl border border-border px-4 py-3"
          required
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value,
            )
          }
          className="w-full rounded-xl border border-border px-4 py-3"
          required
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          Actualizar contraseña
        </button>
      </form>

      {message && (
        <div className="mt-4 rounded-xl border p-4">
          {message}
        </div>
      )}
    </main>
  );
}