-- Supabase Schema for Confluence

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name text,
  bio text,
  avatar_svg text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS setup for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Queues
CREATE TABLE IF NOT EXISTS public.queues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  status text DEFAULT 'searching' NOT NULL, -- 'searching' or 'matched'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Queues
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Queues are viewable by everyone." ON public.queues FOR SELECT USING (true);
CREATE POLICY "Users can insert their own queue." ON public.queues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queue." ON public.queues FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own queue." ON public.queues FOR DELETE USING (auth.uid() = user_id);

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  reasoning text,
  icebreaker text,
  status text DEFAULT 'pending' NOT NULL, -- 'pending', 'accepted', 'declined'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view matches they are part of" ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can insert matches they are part of" ON public.matches FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update matches they are part of" ON public.matches FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages as sender" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_svg)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    ''
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Realtime for Messages
alter publication supabase_realtime add table public.messages;
