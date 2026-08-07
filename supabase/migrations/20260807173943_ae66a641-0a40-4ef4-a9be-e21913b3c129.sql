ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'g';
ALTER TABLE public.foods ADD CONSTRAINT foods_unit_check CHECK (unit IN ('g','ml'));
ALTER TABLE public.food_entries ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'g';
ALTER TABLE public.food_entries ADD CONSTRAINT food_entries_unit_check CHECK (unit IN ('g','ml'));