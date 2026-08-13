-- Execute este código no "SQL Editor" do seu painel do Supabase
-- para habilitar o controle de requisições de IA por usuário.

CREATE TABLE IF NOT EXISTS public.user_ai_limits (
    user_id uuid references auth.users on delete cascade not null,
    date date not null,
    count integer not null default 1,
    primary key (user_id, date)
);

-- Habilita segurança em nível de linha (RLS)
ALTER TABLE public.user_ai_limits ENABLE ROW LEVEL SECURITY;

-- Permite que usuários autenticados possam inserir e ler apenas seus próprios limites
CREATE POLICY "Users can manage their own AI limits" 
    ON public.user_ai_limits
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
