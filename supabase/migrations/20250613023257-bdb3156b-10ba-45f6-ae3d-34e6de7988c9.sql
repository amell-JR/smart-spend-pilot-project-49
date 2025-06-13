
-- First, ensure we have the currencies table and data
CREATE TABLE IF NOT EXISTS public.currencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  symbol text NOT NULL,
  decimal_places integer DEFAULT 2,
  created_at timestamp with time zone DEFAULT now()
);

-- Add the currencies if they don't exist
INSERT INTO public.currencies (code, name, symbol, decimal_places) VALUES
  ('USD', 'US Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 2),
  ('JPY', 'Japanese Yen', '¥', 0),
  ('CAD', 'Canadian Dollar', 'C$', 2),
  ('AUD', 'Australian Dollar', 'A$', 2)
ON CONFLICT (code) DO NOTHING;

-- Ensure the profiles table has the right structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency_id uuid;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_profiles_currencies'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_currencies 
    FOREIGN KEY (currency_id) REFERENCES public.currencies(id);
  END IF;
END $$;

-- Create a more robust user creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_currency_id uuid;
BEGIN
  -- Get USD currency ID as default
  SELECT id INTO default_currency_id 
  FROM public.currencies 
  WHERE code = 'USD' 
  LIMIT 1;
  
  -- If no USD found, get any currency
  IF default_currency_id IS NULL THEN
    SELECT id INTO default_currency_id 
    FROM public.currencies 
    LIMIT 1;
  END IF;
  
  -- If still no currency found, create USD
  IF default_currency_id IS NULL THEN
    INSERT INTO public.currencies (code, name, symbol, decimal_places)
    VALUES ('USD', 'US Dollar', '$', 2)
    RETURNING id INTO default_currency_id;
  END IF;
  
  -- Insert the profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, currency_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      default_currency_id
    );
  EXCEPTION
    WHEN others THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
      -- Try without currency_id as fallback
      INSERT INTO public.profiles (id, email, full_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
      );
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- Allow public read access to currencies (needed for signup)
DROP POLICY IF EXISTS "Allow public read access to currencies" ON public.currencies;
CREATE POLICY "Allow public read access to currencies" ON public.currencies
  FOR SELECT TO public USING (true);

-- Profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
