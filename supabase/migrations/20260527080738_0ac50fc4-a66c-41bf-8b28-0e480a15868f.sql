
CREATE TABLE public.weather_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  active boolean NOT NULL DEFAULT true,
  author_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.weather_alerts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.weather_alerts TO authenticated;
GRANT ALL ON public.weather_alerts TO service_role;

ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts read all" ON public.weather_alerts FOR SELECT USING (true);
CREATE POLICY "alerts admin insert" ON public.weather_alerts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) AND author_id = auth.uid());
CREATE POLICY "alerts admin update" ON public.weather_alerts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "alerts admin delete" ON public.weather_alerts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_alerts;
