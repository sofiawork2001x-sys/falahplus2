
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('farmer','company','agri_expert','finance_expert','vet','admin');
CREATE TYPE public.consultation_type AS ENUM ('technical','vet','financial');
CREATE TYPE public.consultation_status AS ENUM ('open','answered','closed');
CREATE TYPE public.listing_status AS ENUM ('active','rented','hidden');
CREATE TYPE public.financial_kind AS ENUM ('feasibility','support_file');
CREATE TYPE public.financial_status AS ENUM ('pending','approved','rejected');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  wilaya TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF public.app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.user_roles WHERE user_id=_user_id $$;

-- ============ WILAYAS ============
CREATE TABLE public.wilayas (
  code INT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL
);
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wilayas readable by all" ON public.wilayas FOR SELECT USING (true);

INSERT INTO public.wilayas (code,name_ar,name_fr) VALUES
(1,'أدرار','Adrar'),(2,'الشلف','Chlef'),(3,'الأغواط','Laghouat'),(4,'أم البواقي','Oum El Bouaghi'),
(5,'باتنة','Batna'),(6,'بجاية','Béjaïa'),(7,'بسكرة','Biskra'),(8,'بشار','Béchar'),
(9,'البليدة','Blida'),(10,'البويرة','Bouira'),(11,'تمنراست','Tamanrasset'),(12,'تبسة','Tébessa'),
(13,'تلمسان','Tlemcen'),(14,'تيارت','Tiaret'),(15,'تيزي وزو','Tizi Ouzou'),(16,'الجزائر','Alger'),
(17,'الجلفة','Djelfa'),(18,'جيجل','Jijel'),(19,'سطيف','Sétif'),(20,'سعيدة','Saïda'),
(21,'سكيكدة','Skikda'),(22,'سيدي بلعباس','Sidi Bel Abbès'),(23,'عنابة','Annaba'),(24,'قالمة','Guelma'),
(25,'قسنطينة','Constantine'),(26,'المدية','Médéa'),(27,'مستغانم','Mostaganem'),(28,'المسيلة','M''Sila'),
(29,'معسكر','Mascara'),(30,'ورقلة','Ouargla'),(31,'وهران','Oran'),(32,'البيض','El Bayadh'),
(33,'إليزي','Illizi'),(34,'برج بوعريريج','Bordj Bou Arréridj'),(35,'بومرداس','Boumerdès'),(36,'الطارف','El Tarf'),
(37,'تندوف','Tindouf'),(38,'تيسمسيلت','Tissemsilt'),(39,'الوادي','El Oued'),(40,'خنشلة','Khenchela'),
(41,'سوق أهراس','Souk Ahras'),(42,'تيبازة','Tipaza'),(43,'ميلة','Mila'),(44,'عين الدفلى','Aïn Defla'),
(45,'النعامة','Naâma'),(46,'عين تموشنت','Aïn Témouchent'),(47,'غرداية','Ghardaïa'),(48,'غليزان','Relizane'),
(49,'تيميمون','Timimoun'),(50,'برج باجي مختار','Bordj Badji Mokhtar'),(51,'أولاد جلال','Ouled Djellal'),
(52,'بني عباس','Béni Abbès'),(53,'عين صالح','In Salah'),(54,'عين قزام','In Guezzam'),
(55,'تقرت','Touggourt'),(56,'جانت','Djanet'),(57,'المغير','El M''Ghair'),(58,'المنيعة','El Meniaa');

-- ============ LANDS RENT ============
CREATE TABLE public.lands_rent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  area_hectares NUMERIC(10,2) NOT NULL,
  wilaya_code INT REFERENCES public.wilayas(code),
  city TEXT,
  price TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.listing_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lands_rent ENABLE ROW LEVEL SECURITY;

-- ============ EQUIPMENT ============
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT,
  wilaya_code INT REFERENCES public.wilayas(code),
  price TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.listing_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- ============ CONSULTATIONS ============
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.consultation_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  wilaya_code INT REFERENCES public.wilayas(code),
  status public.consultation_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.consultation_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consultation_replies ENABLE ROW LEVEL SECURITY;

-- Map consultation type → expected expert role
CREATE OR REPLACE FUNCTION public.expert_role_for_type(_t public.consultation_type)
RETURNS public.app_role LANGUAGE SQL IMMUTABLE AS $$
  SELECT CASE _t
    WHEN 'technical' THEN 'agri_expert'::public.app_role
    WHEN 'vet' THEN 'vet'::public.app_role
    WHEN 'financial' THEN 'finance_expert'::public.app_role
  END;
$$;

-- ============ FINANCIAL REQUESTS ============
CREATE TABLE public.financial_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.financial_kind NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  amount TEXT,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.financial_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_requests ENABLE ROW LEVEL SECURITY;

-- ============ TRIGGER: auto-create profile + default role on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, wilaya)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'wilaya'
  );
  BEGIN
    _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'farmer'::public.app_role);
  EXCEPTION WHEN others THEN
    _role := 'farmer'::public.app_role;
  END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============
-- profiles
CREATE POLICY "profiles select all authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- user_roles
CREATE POLICY "roles select own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- lands_rent (public marketplace)
CREATE POLICY "lands select all" ON public.lands_rent FOR SELECT USING (true);
CREATE POLICY "lands insert farmer" ON public.lands_rent FOR INSERT TO authenticated WITH CHECK (farmer_id = auth.uid() AND public.has_role(auth.uid(),'farmer'));
CREATE POLICY "lands update own" ON public.lands_rent FOR UPDATE TO authenticated USING (farmer_id = auth.uid());
CREATE POLICY "lands delete own" ON public.lands_rent FOR DELETE TO authenticated USING (farmer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- equipment
CREATE POLICY "equip select all" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "equip insert company" ON public.equipment FOR INSERT TO authenticated WITH CHECK (company_id = auth.uid() AND public.has_role(auth.uid(),'company'));
CREATE POLICY "equip update own" ON public.equipment FOR UPDATE TO authenticated USING (company_id = auth.uid());
CREATE POLICY "equip delete own" ON public.equipment FOR DELETE TO authenticated USING (company_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- consultations: farmer sees own; matching expert sees all of its type
CREATE POLICY "consult select" ON public.consultations FOR SELECT TO authenticated
  USING (farmer_id = auth.uid() OR public.has_role(auth.uid(), public.expert_role_for_type(type)) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "consult insert farmer" ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid() AND public.has_role(auth.uid(),'farmer'));
CREATE POLICY "consult update participants" ON public.consultations FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid() OR public.has_role(auth.uid(), public.expert_role_for_type(type)));

-- consultation_replies
CREATE POLICY "replies select" ON public.consultation_replies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id
    AND (c.farmer_id = auth.uid() OR public.has_role(auth.uid(), public.expert_role_for_type(c.type)) OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "replies insert participants" ON public.consultation_replies FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.consultations c WHERE c.id = consultation_id
    AND (c.farmer_id = auth.uid() OR public.has_role(auth.uid(), public.expert_role_for_type(c.type)))));

-- financial_requests
CREATE POLICY "fin select" ON public.financial_requests FOR SELECT TO authenticated
  USING (farmer_id = auth.uid() OR public.has_role(auth.uid(),'finance_expert') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "fin insert farmer" ON public.financial_requests FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid() AND public.has_role(auth.uid(),'farmer'));
CREATE POLICY "fin update finance" ON public.financial_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'finance_expert') OR public.has_role(auth.uid(),'admin') OR farmer_id = auth.uid());

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('agrovault','agrovault', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "agrovault public read" ON storage.objects FOR SELECT USING (bucket_id = 'agrovault');
CREATE POLICY "agrovault auth upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agrovault' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "agrovault owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'agrovault' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "agrovault owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'agrovault' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lands_rent;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_requests;
