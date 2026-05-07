-- Allow up to two company profiles per user, with an "active" one used for PDFs
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS slot smallint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS label text NOT NULL DEFAULT 'Empresa 1';

-- Ensure each user has at most one row per slot, and slot is 1 or 2
DO $$ BEGIN
  ALTER TABLE public.company_settings
    ADD CONSTRAINT company_settings_slot_check CHECK (slot IN (1,2));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS company_settings_user_slot_uniq
  ON public.company_settings(user_id, slot);

-- Allow DELETE for owners/admins (was missing)
DROP POLICY IF EXISTS "Users can delete company" ON public.company_settings;
CREATE POLICY "Users can delete company" ON public.company_settings
  FOR DELETE USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Enforce single active company per user via trigger
CREATE OR REPLACE FUNCTION public.ensure_single_active_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active THEN
    UPDATE public.company_settings
       SET is_active = false
     WHERE user_id = NEW.user_id
       AND id <> NEW.id
       AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS company_settings_single_active ON public.company_settings;
CREATE TRIGGER company_settings_single_active
  AFTER INSERT OR UPDATE OF is_active ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_active_company();