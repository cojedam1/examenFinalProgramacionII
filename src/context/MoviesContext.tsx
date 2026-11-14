import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Movie, RentalWithDetails, DashboardMetrics } from '@/types/database';
import { INITIAL_PURGE_MOVIES } from '@/constants/purgeMovies';
import { useAuth } from './AuthContext';
import { calculateRentalDates } from '@/utils/dateUtils';

interface AddMovieInput {
  title: string;
  title_es: string;
  release_year: number;
  duration: string;
  genre: string;
  synopsis: string;
  poster_url: string;
}

interface MoviesContextType {
  movies: Movie[];
  rentals: RentalWithDetails[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  rentMovie: (movieId: string) => Promise<{ success: boolean; message: string; rental?: RentalWithDetails }>;
  addMovie: (input: AddMovieInput) => Promise<{ success: boolean; message: string }>;
  deleteMovie: (movieId: string) => Promise<{ success: boolean; message: string }>;
  isMovieRentedByMe: (movieId: string) => { isRented: boolean; rental?: RentalWithDetails };
  myRentals: RentalWithDetails[];
  metrics: DashboardMetrics;
}

const MoviesContext = createContext<MoviesContextType | undefined>(undefined);

const STORAGE_MOVIES_KEY = '@the_purge_app:movies_v1';
const STORAGE_RENTALS_KEY = '@the_purge_app:rentals_v2';

// Semillas iniciales de rentas de demostración para el Dashboard de Analytics
const SEED_RENTALS: RentalWithDetails[] = [
  {
    id: 'rental-seed-001',
    user_id: 'user-demo-client-002',
    movie_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    rented_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // hace 1 día
    return_due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // le quedan 2 días
    status: 'activa',
    movie_title: 'The Purge (La noche de la expiación)',
    movie_poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    user_name: 'Carlos Alejandro Ojeda',
    user_email: 'carlos.ojeda@purge.com',
  },
  {
    id: 'rental-seed-002',
    user_id: 'user-demo-admin-001',
    movie_id: 'a1b2c3d4-0002-4000-8000-000000000002',
    rented_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // hace 2 días
    return_due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'activa',
    movie_title: 'The Purge: Anarchy (12 horas para sobrevivir)',
    movie_poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    user_name: 'Carlos Alejandro Ojeda (Admin)',
    user_email: 'admin@purge.com',
  },
  {
    id: 'rental-seed-003',
    user_id: 'user-demo-guest-003',
    movie_id: 'a1b2c3d4-0001-4000-8000-000000000001',
    rented_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // hace 5 días
    return_due_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'vencida',
    movie_title: 'The Purge (La noche de la expiación)',
    movie_poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    user_name: 'Valeria Morales',
    user_email: 'valeria.m@ejemplo.com',
  },
  {
    id: 'rental-seed-004',
    user_id: 'user-demo-guest-004',
    movie_id: 'a1b2c3d4-0003-4000-8000-000000000003',
    rented_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    return_due_at: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'activa',
    movie_title: 'The Purge: Election Year (El año de la elección)',
    movie_poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    user_name: 'Roberto Gómez',
    user_email: 'roberto.g@ejemplo.com',
  },
];

export const MoviesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>(INITIAL_PURGE_MOVIES);
  const [rentals, setRentals] = useState<RentalWithDetails[]>(SEED_RENTALS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        // Cargar películas desde Supabase
        const { data: moviesData, error: moviesError } = await supabase
          .from('movies')
          .select('*')
          .order('release_year', { ascending: true });

        if (!moviesError && moviesData && moviesData.length > 0) {
          setMovies(moviesData as Movie[]);
        } else {
          // Si no hay películas en Supabase, usar la colección fija
          setMovies(INITIAL_PURGE_MOVIES);
        }

        // Cargar rentas desde Supabase
        let query = supabase.from('rentals').select(`
          id,
          user_id,
          movie_id,
          rented_at,
          return_due_at,
          status,
          created_at,
          movies ( title, title_es, poster_url ),
          profiles ( full_name, email )
        `);

        // Si es usuario regular, filtrar sólo las suyas en Supabase
        if (user && user.role !== 'admin') {
          query = query.eq('user_id', user.id);
        }

        const { data: rentalsData, error: rentalsError } = await query;

        if (!rentalsError && rentalsData) {
          const mappedRentals: RentalWithDetails[] = rentalsData.map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            movie_id: r.movie_id,
            rented_at: r.rented_at,
            return_due_at: r.return_due_at,
            status: r.status,
            created_at: r.created_at,
            movie_title: r.movies ? `${r.movies.title} (${r.movies.title_es})` : 'Película',
            movie_poster: r.movies?.poster_url,
            user_name: r.profiles?.full_name || 'Usuario',
            user_email: r.profiles?.email || '',
          }));
          setRentals(mappedRentals);
        }
      } else {
        // Modo Local/AsyncStorage
        const storedMoviesRaw = await AsyncStorage.getItem(STORAGE_MOVIES_KEY);
        if (storedMoviesRaw) {
          const parsed = JSON.parse(storedMoviesRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMovies(parsed);
          } else {
            setMovies(INITIAL_PURGE_MOVIES);
            await AsyncStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(INITIAL_PURGE_MOVIES));
          }
        } else {
          setMovies(INITIAL_PURGE_MOVIES);
          await AsyncStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(INITIAL_PURGE_MOVIES));
        }

        const storedRentalsRaw = await AsyncStorage.getItem(STORAGE_RENTALS_KEY);
        if (storedRentalsRaw) {
          const parsedRentals = JSON.parse(storedRentalsRaw);
          setRentals(parsedRentals);
        } else {
          setRentals(SEED_RENTALS);
          await AsyncStorage.setItem(STORAGE_RENTALS_KEY, JSON.stringify(SEED_RENTALS));
        }
      }
    } catch (error) {
      console.warn('Error cargando datos de películas y rentas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const rentMovie = async (
    movieId: string
  ): Promise<{ success: boolean; message: string; rental?: RentalWithDetails }> => {
    if (!user) {
      return { success: false, message: 'Debes iniciar sesión para rentar una película.' };
    }

    const movie = movies.find((m) => m.id === movieId);
    if (!movie) {
      return { success: false, message: 'Película no encontrada.' };
    }

    // Verificar si ya tiene una renta activa para esta película
    const alreadyRented = rentals.find(
      (r) => r.user_id === user.id && r.movie_id === movieId && r.status === 'activa'
    );
    if (alreadyRented) {
      return {
        success: false,
        message: `Ya tienes rentada "${movie.title}". Disfrútala hasta el vencimiento.`,
      };
    }

    // Cálculo estricto de 3 días (inicio a fin)
    const { rentedAt, returnDueAt } = calculateRentalDates();

    const newRental: RentalWithDetails = {
      id: isSupabaseConfigured ? undefined as any : `rental-${Date.now()}`,
      user_id: user.id,
      movie_id: movieId,
      rented_at: rentedAt,
      return_due_at: returnDueAt,
      status: 'activa',
      created_at: new Date().toISOString(),
      movie_title: `${movie.title} (${movie.title_es})`,
      movie_poster: movie.poster_url,
      user_name: user.full_name,
      user_email: user.email,
    };

    try {
      if (isSupabaseConfigured) {
        // Obtener ID del usuario activo de la sesión Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        const activeUserId = sessionData?.session?.user?.id || user.id;

        const { data, error } = await supabase
          .from('rentals')
          .insert({
            user_id: activeUserId,
            movie_id: movieId,
            rented_at: rentedAt,
            return_due_at: returnDueAt,
            status: 'activa',
          })
          .select()
          .single();

        if (error) {
          return { success: false, message: `Error al registrar renta: ${error.message}` };
        }
        newRental.id = data.id;
        newRental.user_id = activeUserId;
      } else {
        const updatedRentals = [newRental, ...rentals];
        setRentals(updatedRentals);
        await AsyncStorage.setItem(STORAGE_RENTALS_KEY, JSON.stringify(updatedRentals));
      }

      // Actualizar estado local
      setRentals((prev) => [newRental, ...prev.filter((r) => r.id !== newRental.id)]);

      return {
        success: true,
        message: `¡"${movie.title}" rentada exitosamente por 3 días!`,
        rental: newRental,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error al procesar la renta.' };
    }
  };

  const addMovie = async (input: AddMovieInput): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Solo los administradores pueden agregar películas.' };
    }

    const newMovie: Movie = {
      id: isSupabaseConfigured ? undefined as any : `purge-custom-${Date.now()}`,
      title: input.title.trim(),
      title_es: input.title_es.trim(),
      release_year: Number(input.release_year),
      duration: input.duration.trim(),
      genre: input.genre.trim(),
      synopsis: input.synopsis.trim(),
      poster_url: input.poster_url.trim() || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('movies')
          .insert(newMovie)
          .select()
          .single();

        if (error) {
          return { success: false, message: error.message };
        }
        newMovie.id = data.id;
      } else {
        const updated = [...movies, newMovie];
        setMovies(updated);
        await AsyncStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(updated));
      }

      setMovies((prev) => [...prev, newMovie]);
      return { success: true, message: 'Película agregada exitosamente.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error al agregar película.' };
    }
  };

  const deleteMovie = async (movieId: string): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Solo los administradores pueden eliminar películas.' };
    }

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('movies').delete().eq('id', movieId);
        if (error) {
          return { success: false, message: error.message };
        }
      } else {
        const updated = movies.filter((m) => m.id !== movieId);
        setMovies(updated);
        await AsyncStorage.setItem(STORAGE_MOVIES_KEY, JSON.stringify(updated));
      }

      setMovies((prev) => prev.filter((m) => m.id !== movieId));
      // También filtrar de rentas en pantalla
      setRentals((prev) => prev.filter((r) => r.movie_id !== movieId));

      return { success: true, message: 'Película eliminada correctamente.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error al eliminar película.' };
    }
  };

  const isMovieRentedByMe = (movieId: string): { isRented: boolean; rental?: RentalWithDetails } => {
    if (!user) return { isRented: false };
    const rental = rentals.find(
      (r) => r.user_id === user.id && r.movie_id === movieId && r.status === 'activa'
    );
    return {
      isRented: !!rental,
      rental,
    };
  };

  const myRentals = useMemo(() => {
    if (!user) return [];
    return rentals.filter((r) => r.user_id === user.id);
  }, [rentals, user]);

  const metrics: DashboardMetrics = useMemo(() => {
    const totalRentals = rentals.length;
    const activeRentals = rentals.filter((r) => r.status === 'activa').length;
    const totalMovies = movies.length;

    // Conteo único de usuarios
    const uniqueUsers = new Set(rentals.map((r) => r.user_id));
    const totalUsers = Math.max(uniqueUsers.size, 1);

    // Conteo por película
    const countsMap: { [title: string]: number } = {};
    rentals.forEach((r) => {
      const title = r.movie_title.split('(')[0].trim() || 'Película';
      countsMap[title] = (countsMap[title] || 0) + 1;
    });

    let mostRentedMovie = 'Ninguna aún';
    let maxCount = 0;

    const rentalsByMovie = Object.keys(countsMap).map((title) => {
      const count = countsMap[title];
      if (count > maxCount) {
        maxCount = count;
        mostRentedMovie = title;
      }
      return {
        title,
        count,
        percentage: totalRentals > 0 ? Math.round((count / totalRentals) * 100) : 0,
      };
    });

    rentalsByMovie.sort((a, b) => b.count - a.count);

    return {
      totalRentals,
      activeRentals,
      totalMovies,
      totalUsers,
      mostRentedMovie: mostRentedMovie !== 'Ninguna aún' ? mostRentedMovie : (movies[0]?.title || 'The Purge'),
      rentalsByMovie,
    };
  }, [rentals, movies]);

  return (
    <MoviesContext.Provider
      value={{
        movies,
        rentals,
        isLoading,
        refreshData,
        rentMovie,
        addMovie,
        deleteMovie,
        isMovieRentedByMe,
        myRentals,
        metrics,
      }}>
      {children}
    </MoviesContext.Provider>
  );
};

export function useMovies() {
  const context = useContext(MoviesContext);
  if (!context) {
    throw new Error('useMovies debe ser utilizado dentro de un MoviesProvider');
  }
  return context;
}
