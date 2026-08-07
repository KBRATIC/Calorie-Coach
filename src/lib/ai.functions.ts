import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  text: z.string().min(2).max(1000),
  meal: z.string().min(1).max(30),
});

export const parseMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const { parseMealText } = await import("@/lib/ai.server");
    return { items: await parseMealText(data.text, data.meal) };
  });
