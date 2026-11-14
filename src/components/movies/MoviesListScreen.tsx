import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMovies } from '@/context/MoviesContext';
import { useAuth } from '@/context/AuthContext';
import { MovieCard } from './MovieCard';
import { RentalModal } from './RentalModal';
import { Movie } from '@/types/database';

export const MoviesListScreen: React.FC = () => {
  const { movies, isMovieRentedByMe, rentMovie, deleteMovie, myRentals } = useMovies();
  const { user } = useAuth();

  const [selectedMovieForRental, setSelectedMovieForRental] = useState<Movie | null>(null);
  const [isProcessingRental, setIsProcessingRental] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'rented'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleOpenRental = (movie: Movie) => {
    setSelectedMovieForRental(movie);
  };

  const handleConfirmRental = async (movieId: string) => {
    setIsProcessingRental(true);
    const result = await rentMovie(movieId);
    setIsProcessingRental(false);
    setSelectedMovieForRental(null);

    setNotification({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    // Desaparecer la notificación tras 4 segundos
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleDeleteMovie = (movieId: string, title: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Deseas eliminar la película "${title}"?`)) {
        deleteMovie(movieId);
      }
    } else {
      Alert.alert('Eliminar Película', `¿Deseas eliminar "${title}" del catálogo?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteMovie(movieId) },
      ]);
    }
  };

  // Filtrado
  const displayedMovies = filterMode === 'all'
    ? movies
    : movies.filter((m) => isMovieRentedByMe(m.id).isRented);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Banner Principal de The Purge */}
      <View style={styles.heroBanner}>
        <View style={styles.heroHeaderBadge}>
          <Ionicons name="warning" size={14} color="#FFF" />
          <Text style={styles.heroBadgeText}>SAGA OFICIAL • ALQUILER EXCLUSIVO</Text>
        </View>
        <Text style={styles.heroTitle}>THE PURGE COLLECTION</Text>
        <Text style={styles.heroSubtitle}>
          Renta cualquier película por un periodo estricto de 3 días (72 horas)
        </Text>
      </View>

      {/* Notificación Flotante */}
      {notification ? (
        <View
          style={[
            styles.notificationBox,
            notification.type === 'success' ? styles.notifSuccess : styles.notifError,
          ]}>
          <Ionicons
            name={notification.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={notification.type === 'success' ? '#10B981' : '#EF4444'}
          />
          <Text style={styles.notifText}>{notification.message}</Text>
        </View>
      ) : null}

      {/* Selector de Filtro: Catálogo Completo vs Mis Rentas */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'all' && styles.filterBtnActive]}
          onPress={() => setFilterMode('all')}>
          <Ionicons
            name="film-outline"
            size={16}
            color={filterMode === 'all' ? '#FFF' : '#9CA3AF'}
          />
          <Text style={[styles.filterBtnText, filterMode === 'all' && styles.filterBtnTextActive]}>
            Catálogo ({movies.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'rented' && styles.filterBtnActive]}
          onPress={() => setFilterMode('rented')}>
          <Ionicons
            name="time-outline"
            size={16}
            color={filterMode === 'rented' ? '#FFF' : '#9CA3AF'}
          />
          <Text style={[styles.filterBtnText, filterMode === 'rented' && styles.filterBtnTextActive]}>
            Mis Rentas Activas ({myRentals.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Películas */}
      <View style={styles.moviesListContainer}>
        {displayedMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={40} color="#4B5563" />
            <Text style={styles.emptyTitle}>
              {filterMode === 'rented'
                ? 'No tienes rentas activas en este momento'
                : 'No hay películas en el catálogo'}
            </Text>
            {filterMode === 'rented' && (
              <TouchableOpacity
                style={styles.exploreCatalogBtn}
                onPress={() => setFilterMode('all')}>
                <Text style={styles.exploreCatalogBtnText}>Explorar Catálogo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayedMovies.map((movie) => {
            const rentalStatus = isMovieRentedByMe(movie.id);
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                rental={rentalStatus.rental}
                onRentPress={handleOpenRental}
                isAdmin={isAdmin}
                onDeletePress={handleDeleteMovie}
              />
            );
          })
        )}
      </View>

      {/* Modal de Confirmación de Renta */}
      <RentalModal
        visible={!!selectedMovieForRental}
        movie={selectedMovieForRental}
        onClose={() => setSelectedMovieForRental(null)}
        onConfirm={handleConfirmRental}
        isProcessing={isProcessingRental}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#0A0A0C',
    alignItems: 'center',
  },
  heroBanner: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#161720',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#282A3A',
    marginBottom: 16,
    alignItems: 'center',
  },
  heroHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E50914',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  notificationBox: {
    width: '100%',
    maxWidth: 680,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  notifSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  notifError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  notifText: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  filterBar: {
    width: '100%',
    maxWidth: 680,
    flexDirection: 'row',
    backgroundColor: '#161720',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    gap: 6,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: '#E50914',
  },
  filterBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  moviesListContainer: {
    width: '100%',
    maxWidth: 680,
  },
  emptyContainer: {
    backgroundColor: '#161720',
    borderRadius: 12,
    padding: 36,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  exploreCatalogBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  exploreCatalogBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
