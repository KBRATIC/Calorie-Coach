CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.user_goals (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  sex TEXT NOT NULL DEFAULT 'male',
  birth_date DATE,
  age INTEGER,
  height_cm NUMERIC NOT NULL DEFAULT 170,
  weight_kg NUMERIC NOT NULL DEFAULT 70,
  activity_factor NUMERIC NOT NULL DEFAULT 1.375,
  goal_type TEXT NOT NULL DEFAULT 'maintain',
  daily_calorie_goal INTEGER NOT NULL DEFAULT 2000,
  bmr INTEGER,
  tdee INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_goals TO authenticated;
GRANT ALL ON public.user_goals TO service_role;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.user_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  kcal_per_100g NUMERIC NOT NULL,
  default_measure TEXT,
  default_grams NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX foods_name_idx ON public.foods (lower(name));
CREATE INDEX foods_user_idx ON public.foods (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read public and own foods" ON public.foods FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "insert own foods" ON public.foods FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own foods" ON public.foods FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own foods" ON public.foods FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  food_id UUID REFERENCES public.foods ON DELETE SET NULL,
  name TEXT NOT NULL,
  grams NUMERIC,
  kcal NUMERIC NOT NULL,
  meal TEXT NOT NULL DEFAULT 'other',
  consumed_on DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX food_entries_user_date_idx ON public.food_entries (user_id, consumed_on);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_entries TO authenticated;
GRANT ALL ON public.food_entries TO service_role;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own entries" ON public.food_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);