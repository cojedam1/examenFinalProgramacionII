-- ==============================================================================
-- SCHEMA SUPABASE: APP DE RENTA DE PELICULAS "THE PURGE"
-- EXAMEN FINAL DE PROGRAMACIÓN
-- ==============================================================================

-- 1. TABLA: profiles (Perfiles de Usuario)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  age INTEGER CHECK (age >= 0),
  card_number_masked TEXT NOT NULL, -- e.g. "•••• •••• •••• 4532"
  card_last_four TEXT NOT NULL,     -- e.g. "4532"
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: movies (Catálogo de Películas)
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_es TEXT,
  synopsis TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  duration TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'Terror / Suspenso / Distopía',
  poster_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: rentals (Registro de Rentas)
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  rented_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  return_due_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '3 days'),
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'devuelta', 'vencida')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. TRIGGER AUTOMÁTICO: CREACIÓN DE PERFIL AL REGISTRARSE EN SUPABASE AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    age,
    card_number_masked,
    card_last_four,
    avatar_url,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 18),
    COALESCE(NEW.raw_user_meta_data->>'card_number_masked', '•••• •••• •••• 0000'),
    COALESCE(NEW.raw_user_meta_data->>'card_last_four', '0000'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador después de insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. SEGURIDAD A NIVEL DE FILAS (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- Helper para verificar si el usuario logueado es Administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- --- POLÍTICAS PARA PROFILES ---
DROP POLICY IF EXISTS "Ver perfiles" ON public.profiles;
CREATE POLICY "Ver perfiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Actualizar propio perfil" ON public.profiles;
CREATE POLICY "Actualizar propio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Insertar perfil" ON public.profiles;
CREATE POLICY "Insertar perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- --- POLÍTICAS PARA MOVIES ---
DROP POLICY IF EXISTS "Cualquiera autenticado puede ver peliculas" ON public.movies;
CREATE POLICY "Cualquiera autenticado puede ver peliculas"
  ON public.movies FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Solo admin puede insertar peliculas" ON public.movies;
CREATE POLICY "Solo admin puede insertar peliculas"
  ON public.movies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Solo admin puede actualizar peliculas" ON public.movies;
CREATE POLICY "Solo admin puede actualizar peliculas"
  ON public.movies FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Solo admin puede eliminar peliculas" ON public.movies;
CREATE POLICY "Solo admin puede eliminar peliculas"
  ON public.movies FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- --- POLÍTICAS PARA RENTALS ---
DROP POLICY IF EXISTS "Usuarios ven sus rentas y admins ven todas" ON public.rentals;
CREATE POLICY "Usuarios ven sus rentas y admins ven todas"
  ON public.rentals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Usuarios autenticados pueden rentar" ON public.rentals;
CREATE POLICY "Usuarios autenticados pueden rentar"
  ON public.rentals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Actualizar rentas" ON public.rentals;
CREATE POLICY "Actualizar rentas"
  ON public.rentals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- 6. DATOS INICIALES: COLECCIÓN FIJA "THE PURGE" (5 PELÍCULAS)
-- ==============================================================================
INSERT INTO public.movies (title, title_es, synopsis, release_year, duration, genre, poster_url)
VALUES
(
  'The Purge',
  'La noche de la expiación',
  'En una América distópica asolada por el crimen, el gobierno sanciona un período anual de 12 horas en el que toda actividad delictiva, incluido el asesinato, es legal.',
  2013,
  '1h 25m',
  'Terror / Suspenso / Distopía',
  'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80'
),
(
  'The Purge: Anarchy',
  '12 horas para sobrevivir',
  'Tres grupos de personas quedan varados en las peligrosas calles de Los Ángeles durante la noche de la Purga anual e intentan sobrevivir a los cazadores.',
  2014,
  '1h 43m',
  'Acción / Suspenso / Distopía',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
),
(
  'The Purge: Election Year',
  '12 horas para sobrevivir: El año de la elección',
  'Una senadora de EE. UU. promete eliminar la Purga si gana la presidencia, desatando una cacería mortal dirigida hacia ella durante la noche más violenta.',
  2016,
  '1h 49m',
  'Acción / Suspenso / Política',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80'
),
(
  'The First Purge',
  '12 horas para sobrevivir: El inicio',
  'Precuela que explora el experimento sociológico original en Staten Island impulsado por los Nuevos Padres Fundadores de América para contener la criminalidad.',
  2018,
  '1h 37m',
  'Acción / Suspenso / Distopía',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80'
),
(
  'The Forever Purge',
  'La purga por siempre',
  'Una secta de asesinos enmascarados decide que la Purga no terminará al amanecer y continúa la matanza, forzando a dos familias a huir hacia la frontera mexicana.',
  2021,
  '1h 43m',
  'Acción / Western / Terror',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80'
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 7. BUCKET DE ALMACENAMIENTO PARA AVATARES / FOTOS (OPCIONAL EN SUPABASE STORAGE)
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;
