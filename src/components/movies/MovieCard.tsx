import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie, RentalWithDetails } from '@/types/database';
import { getRemainingRentalTime, formatShortDate } from '@/utils/dateUtils';

interface MovieCardProps {
  movie: Movie;
  rental?: RentalWithDetails;
  onRentPress: (movie: Movie) => void;
  isAdmin?: boolean;
  onDeletePress?: (movieId: string, title: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  rental,
  onRentPress,
  isAdmin = false,
  onDeletePress,
}) => {
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  const isRented = !!rental && rental.status === 'activa';
  const remainingTime = rental ? getRemainingRentalTime(rental.return_due_at) : null;

  return (
    <View style={[styles.card, isRented && styles.cardRented]}>
      {/* Imagen de Portada con Badge de Renta */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: movie.poster_url }}
          style={styles.posterImage}
          resizeMode="cover"
        />
        {isRented && (
          <View style={styles.rentedOverlayBadge}>
            <Ionicons name="time" size={12} color="#FFF" />
            <Text style={styles.rentedOverlayText}>{remainingTime?.text}</Text>
          </View>
        )}
      </View>

      {/* Contenido y Datos */}
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={styles.titleText}>{movie.title}</Text>
            <Text style={styles.titleEsText}>{movie.title_es}</Text>
          </View>

          {isAdmin && onDeletePress && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeletePress(movie.id, movie.title)}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Metadatos: Año, Duración, Género */}
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{movie.release_year}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{movie.duration}</Text>
          </View>
          <View style={[styles.metaBadge, styles.genreBadge]}>
            <Text style={styles.genreText} numberOfLines={1}>
              {movie.genre}
            </Text>
          </View>
        </View>

        {/* Sinopsis */}
        <Text
          style={styles.synopsisText}
          numberOfLines={showFullSynopsis ? undefined : 2}>
          {movie.synopsis}
        </Text>
        <TouchableOpacity
          onPress={() => setShowFullSynopsis(!showFullSynopsis)}
          style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>
            {showFullSynopsis ? 'Ver menos' : 'Leer sinopsis completa'}
          </Text>
        </TouchableOpacity>

        {/* Estado y Botón de Renta */}
        {isRented ? (
          <View style={styles.rentedInfoContainer}>
            <View style={styles.rentedDetailsRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.rentedDetailsText}>
                Rentada hasta el {formatShortDate(rental.return_due_at)}
              </Text>
            </View>
            <TouchableOpacity style={styles.alreadyRentedButton} disabled>
              <Ionicons name="play-circle" size={18} color="#10B981" />
              <Text style={styles.alreadyRentedButtonText}>Disponible en tu cuenta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.rentButton}
            onPress={() => onRentPress(movie)}>
            <Ionicons name="film" size={16} color="#FFFFFF" />
            <Text style={styles.rentButtonText}>Rentar (3 Días)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#15161C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262734',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRented: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#131917',
  },
  imageContainer: {
    width: '100%',
    height: 190,
    backgroundColor: '#1C1D26',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  rentedOverlayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  rentedOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  titleEsText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  metaBadge: {
    backgroundColor: '#20222D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  genreBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    borderColor: 'rgba(229, 9, 20, 0.25)',
    borderWidth: 1,
  },
  genreText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  synopsisText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  readMoreText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '500',
  },
  rentButton: {
    backgroundColor: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  rentButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rentedInfoContainer: {
    marginTop: 10,
    gap: 8,
  },
  rentedDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rentedDetailsText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  alreadyRentedButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alreadyRentedButtonText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
