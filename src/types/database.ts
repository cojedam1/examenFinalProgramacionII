export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  age: number;
  card_number_masked: string; // e.g. "•••• •••• •••• 4532"
  card_last_four: string;     // e.g. "4532"
  avatar_url: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Movie {
  id: string;
  title: string;
  title_es: string;
  synopsis: string;
  release_year: number;
  duration: string;
  genre: string;
  poster_url: string;
  created_at?: string;
}

export interface Rental {
  id: string;
  user_id: string;
  movie_id: string;
  rented_at: string;
  return_due_at: string;
  status: 'activa' | 'devuelta' | 'vencida';
  created_at?: string;
}

export interface RentalWithDetails extends Rental {
  movie_title: string;
  movie_poster?: string;
  user_name: string;
  user_email: string;
}

export interface DashboardMetrics {
  totalRentals: number;
  activeRentals: number;
  totalMovies: number;
  totalUsers: number;
  mostRentedMovie: string;
  rentalsByMovie: { title: string; count: number; percentage: number }[];
}
