-- Execute este comando no SQL Editor do seu projeto Supabase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;
