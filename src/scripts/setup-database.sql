-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  github_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create environment_variables table
CREATE TABLE IF NOT EXISTS environment_variables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID REFERENCES repositories ON DELETE CASCADE,
  key TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create activities table for tracking user actions
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  repository_id UUID REFERENCES repositories ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own repositories" ON repositories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own repositories" ON repositories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own repositories" ON repositories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own repositories" ON repositories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own environment variables" ON environment_variables 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = environment_variables.repository_id 
      AND repositories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own environment variables" ON environment_variables 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = environment_variables.repository_id 
      AND repositories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
