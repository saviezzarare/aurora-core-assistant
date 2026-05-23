
-- 1) PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Add user_id columns
ALTER TABLE public.conversations         ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.chat_messages         ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.reminders             ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.prospected_companies  ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.prospection_searches  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 3) Drop existing public policies
DROP POLICY IF EXISTS "Public access conversations"        ON public.conversations;
DROP POLICY IF EXISTS "Public access chat_messages"        ON public.chat_messages;
DROP POLICY IF EXISTS "Public access reminders"            ON public.reminders;
DROP POLICY IF EXISTS "Public access prospected_companies" ON public.prospected_companies;
DROP POLICY IF EXISTS "Public access prospection_searches" ON public.prospection_searches;

-- 4) New scoped policies — conversations
CREATE POLICY "Users select own conversations" ON public.conversations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON public.conversations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conversations" ON public.conversations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- chat_messages
CREATE POLICY "Users select own chat_messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chat_messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own chat_messages" ON public.chat_messages
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own chat_messages" ON public.chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- reminders
CREATE POLICY "Users select own reminders" ON public.reminders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reminders" ON public.reminders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reminders" ON public.reminders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reminders" ON public.reminders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- prospected_companies
CREATE POLICY "Users select own prospected_companies" ON public.prospected_companies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prospected_companies" ON public.prospected_companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prospected_companies" ON public.prospected_companies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own prospected_companies" ON public.prospected_companies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- prospection_searches
CREATE POLICY "Users select own prospection_searches" ON public.prospection_searches
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prospection_searches" ON public.prospection_searches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prospection_searches" ON public.prospection_searches
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own prospection_searches" ON public.prospection_searches
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5) Remove reminders from realtime publication (não usado — evita vazamento)
ALTER PUBLICATION supabase_realtime DROP TABLE public.reminders;
