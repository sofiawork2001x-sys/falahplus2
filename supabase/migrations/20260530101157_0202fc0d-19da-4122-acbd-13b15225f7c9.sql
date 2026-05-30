
CREATE TABLE public.crop_diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  symptoms text NOT NULL DEFAULT '',
  treatment text NOT NULL DEFAULT '',
  season text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.crop_diseases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_diseases TO authenticated;
GRANT ALL ON public.crop_diseases TO service_role;

ALTER TABLE public.crop_diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diseases read all" ON public.crop_diseases FOR SELECT USING (true);
CREATE POLICY "diseases admin insert" ON public.crop_diseases FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "diseases admin update" ON public.crop_diseases FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "diseases admin delete" ON public.crop_diseases FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));


CREATE TABLE public.ain_defla_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  area_hectares numeric NOT NULL DEFAULT 0,
  crops_count integer NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ain_defla_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ain_defla_stats TO authenticated;
GRANT ALL ON public.ain_defla_stats TO service_role;

ALTER TABLE public.ain_defla_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_stats read all" ON public.ain_defla_stats FOR SELECT USING (true);
CREATE POLICY "ad_stats admin insert" ON public.ain_defla_stats FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "ad_stats admin update" ON public.ain_defla_stats FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "ad_stats admin delete" ON public.ain_defla_stats FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
