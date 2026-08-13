import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada. A exclusão completa requer privilégios de administrador.");
    }

    const supabaseUrl = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    if (!supabaseUrl) throw new Error("SUPABASE_URL não configurada.");

    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
      // 1. Delete all user data
      await adminClient.from("food_entries").delete().eq("user_id", context.userId);
      await adminClient.from("user_goals").delete().eq("user_id", context.userId);

      // 2. Delete the user from Auth
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(context.userId);
      
      if (deleteAuthError) {
        console.error("Erro ao deletar usuário do Auth:", deleteAuthError);
        throw new Error("Não foi possível excluir a autenticação do usuário.");
      }

      return { success: true };
    } catch (err: any) {
      console.error("Erro no deleteAccount:", err);
      throw new Error(err.message || "Erro interno ao excluir conta.");
    }
  });
