-- Dummy profiles seed script
-- Run this in your Supabase SQL Editor

-- 1. Insert dummy records into auth.users so foreign key constraint is satisfied
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alice"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bob"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charlie@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Charlie"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diana@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diana"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ethan@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ethan"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fiona@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fiona"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'george@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"George"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hannah@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hannah"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ian@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ian"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'julia@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Julia"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kevin@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kevin"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'luna@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Luna"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mason@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mason"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nora@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nora"}', now(), now(), '', ''),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'oliver@demo.local', '', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Oliver"}', now(), now(), '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert or update the dummy profile details
INSERT INTO public.profiles (id, display_name, bio, avatar_svg)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alice', 'I am fascinated by the intersection of linguistics and cognitive science. Currently reading up on Chomsky.', '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#aecccc"/></svg>'),
  ('00000000-0000-0000-0000-000000000002', 'Bob', 'A software engineer who loves discussing system architecture, distributed systems, and functional programming paradigms.', '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#b6cbc3"/></svg>'),
  ('00000000-0000-0000-0000-000000000003', 'Charlie', 'Passionate about ancient history, specifically the late Roman Republic and its political institutions.', '<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,0 40,40 0,40" fill="#e4c199"/></svg>'),
  ('00000000-0000-0000-0000-000000000004', 'Diana', 'Looking to discuss the ethics of artificial intelligence and its impact on the future of labor.', '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#4f625c"/></svg>'),
  ('00000000-0000-0000-0000-000000000005', 'Ethan', 'I love delving into astrophysics, dark matter theories, and the expansion of the universe.', '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#1a3636"/></svg>'),
  ('00000000-0000-0000-0000-000000000006', 'Fiona', 'An avid reader of modernist literature. Joyce, Woolf, and Eliot are my favorites.', '<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,0 40,40 0,40" fill="#b4946f"/></svg>'),
  ('00000000-0000-0000-0000-000000000007', 'George', 'Studying urban planning and sustainable development. Let us talk about 15-minute cities.', '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#829f9f"/></svg>'),
  ('00000000-0000-0000-0000-000000000008', 'Hannah', 'Deeply interested in behavioral economics and how cognitive biases affect financial markets.', '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#cfe4dc"/></svg>'),
  ('00000000-0000-0000-0000-000000000009', 'Ian', 'Exploring the world of renewable energy technologies and next-gen battery storage.', '<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,0 40,40 0,40" fill="#ffddb7"/></svg>'),
  ('00000000-0000-0000-0000-000000000010', 'Julia', 'A researcher focusing on the gut microbiome and its connection to mental health.', '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#476363"/></svg>'),
  ('00000000-0000-0000-0000-000000000011', 'Kevin', 'Classical music enthusiast. Always up for a deep dive into Bach’s counterpoint or Mahler’s symphonies.', '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#384b45"/></svg>'),
  ('00000000-0000-0000-0000-000000000012', 'Luna', 'Fascinated by evolutionary biology and the mechanisms of natural selection.', '<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,0 40,40 0,40" fill="#5a4224"/></svg>'),
  ('00000000-0000-0000-0000-000000000013', 'Mason', 'Discussing existential philosophy, particularly the works of Kierkegaard and Sartre.', '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#022020"/></svg>'),
  ('00000000-0000-0000-0000-000000000014', 'Nora', 'I love talking about the history of mathematics and the lives of great mathematicians.', '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#0c1f1a"/></svg>'),
  ('00000000-0000-0000-0000-000000000015', 'Oliver', 'Interested in the geopolitics of the Middle East and historical international relations.', '<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,0 40,40 0,40" fill="#2a1801"/></svg>')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_svg = EXCLUDED.avatar_svg;
