
-- First, let's add some default currencies to the currencies table
INSERT INTO public.currencies (code, name, symbol, decimal_places) VALUES
  ('USD', 'US Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 2),
  ('JPY', 'Japanese Yen', '¥', 0),
  ('CAD', 'Canadian Dollar', 'C$', 2),
  ('AUD', 'Australian Dollar', 'A$', 2)
ON CONFLICT (code) DO NOTHING;

-- Create or replace the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_currency_id uuid;
BEGIN
  -- Get USD currency ID as default, or any currency if USD doesn't exist
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
  
  -- If still no currency found, create a default one
  IF default_currency_id IS NULL THEN
    INSERT INTO public.currencies (code, name, symbol, decimal_places)
    VALUES ('USD', 'US Dollar', '$', 2)
    RETURNING id INTO default_currency_id;
  END IF;
  
  -- Insert the profile
  INSERT INTO public.profiles (id, email, full_name, currency_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    default_currency_id
  );
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables to ensure proper security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can manage own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can manage own budgets" ON public.budgets;

-- Create basic RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create basic RLS policies for categories
CREATE POLICY "Users can view own categories" ON public.categories
  FOR ALL USING (auth.uid() = user_id);

-- Create basic RLS policies for expenses
CREATE POLICY "Users can manage own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

-- Create basic RLS policies for budgets
CREATE POLICY "Users can manage own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id);
