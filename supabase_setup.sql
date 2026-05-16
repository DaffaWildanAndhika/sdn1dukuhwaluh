-- SQL for Supabase Editor to setup the database schema for E-School Hub

-- 1. News/Berita table
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Gallery table
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  album TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('akademik', 'non-akademik')),
  description TEXT,
  image_url TEXT,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Agenda table
CREATE TABLE agenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('akan datang', 'selesai')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PPDB table
CREATE TABLE ppdb_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  document_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'diterima', 'ditolak')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Guest Book table
CREATE TABLE guest_book (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  institution TEXT,
  purpose TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) - Basic setup
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppdb_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_book ENABLE ROW LEVEL SECURITY;

-- Allow public read access to most tables
CREATE POLICY "Public Read Access" ON news FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON agenda FOR SELECT USING (true);

-- Allow public insert to PPDB and Guest Book
CREATE POLICY "Public Insert PPDB" ON ppdb_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Guest Book" ON guest_book FOR INSERT WITH CHECK (true);

-- Admin Dashboard access (Requires Auth)
CREATE POLICY "Admin All Access" ON news USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access" ON gallery USING (auth.role() = 'authenticated');
-- ... repeat for other tables for full admin control
