import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMovies } from '@/context/MoviesContext';
import { useAuth } from '@/context/AuthContext';
import { AddMovieModal } from './AddMovieModal';
import { formatRentalDate, getRemainingRentalTime } from '@/utils/dateUtils';
import { Movie } from '@/types/database';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { movies, rentals, metrics, deleteMovie } = useMovies();
  const [activeTab, setActiveTab] = useState<'analytics' | 'catalog'>('analytics');
  const [showAddModal, setShowAddModal] = useState(false);

  // Advertencia si un usuario sin rol admin llega aquí
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.unauthorizedContainer}>
        <Ionicons name="shield-outline" size={48} color="#EF4444" />
        <Text style={styles.unauthorizedTitle}>Acceso Restringido</Text>
        <Text style={styles.unauthorizedText}>
          Esta sección está reservada exclusivamente para usuarios con rol de Administrador.
        </Text>
      </View>
    );
  }

  const handleDeleteMoviePrompt = (movieId: string, title: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas eliminar permanentemente la película "${title}"?`
      );
      if (confirmed) {
        deleteMovie(movieId);
      }
    } else {
      Alert.alert(
        'Confirmar Eliminación',
        `¿Deseas eliminar la película "${title}" del catálogo?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => deleteMovie(movieId),
          },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado del Panel de Administrador */}
      <View style={styles.headerSection}>
        <View style={styles.badgeAdminRow}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FFF" />
            <Text style={styles.adminBadgeText}>PANEL DE CONTROL ADMINISTRATIVO</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>Gestión & Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Monitoreo en tiempo real de rentas y catálogo de la saga The Purge
        </Text>
      </View>

      {/* Tabs de Navegación del Admin */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'analytics' && styles.tabBtnActive]}
          onPress={() => setActiveTab('analytics')}>
          <Ionicons
            name="bar-chart"
            size={16}
            color={activeTab === 'analytics' ? '#FFF' : '#9CA3AF'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'analytics' && styles.tabBtnTextActive]}>
            Dashboard & Rentas ({rentals.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'catalog' && styles.tabBtnActive]}
          onPress={() => setActiveTab('catalog')}>
          <Ionicons
            name="film"
            size={16}
            color={activeTab === 'catalog' ? '#FFF' : '#9CA3AF'}
          />
          <Text style={[styles.tabBtnText, activeTab === 'catalog' && styles.tabBtnTextActive]}>
            Catálogo de Películas ({movies.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO 1: ANALYTICS & INFORME DE RENTAS */}
      {activeTab === 'analytics' ? (
        <View style={styles.sectionWrapper}>
          {/* Tarjetas KPI de Métricas */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(229, 9, 20, 0.15)' }]}>
                <Ionicons name="receipt" size={20} color="#E50914" />
              </View>
              <Text style={styles.kpiValue}>{metrics.totalRentals}</Text>
              <Text style={styles.kpiLabel}>Total Rentas</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="time" size={20} color="#10B981" />
              </View>
              <Text style={styles.kpiValue}>{metrics.activeRentals}</Text>
              <Text style={styles.kpiLabel}>Rentas Activas</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Ionicons name="film-outline" size={20} color="#38BDF8" />
              </View>
              <Text style={styles.kpiValue}>{metrics.totalMovies}</Text>
              <Text style={styles.kpiLabel}>Películas Catálogo</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.kpiValueSpecial} numberOfLines={1}>
                {metrics.mostRentedMovie}
              </Text>
              <Text style={styles.kpiLabel}>Más Rentada</Text>
            </View>
          </View>

          {/* Gráfico de Barras Analytics: Rentas por Película */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="analytics" size={18} color="#E50914" />
              <Text style={styles.chartTitle}>Distribución de Rentas por Película</Text>
            </View>

            <View style={styles.barsList}>
              {metrics.rentalsByMovie.map((item, index) => (
                <View key={index} style={styles.barItem}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barMovieName} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.barMovieCount}>
                      {item.count} {item.count === 1 ? 'renta' : 'rentas'} ({item.percentage}%)
                    </Text>
                  </View>

                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(item.percentage, 8)}%`,
                          backgroundColor: index === 0 ? '#E50914' : index === 1 ? '#EF4444' : '#F87171',
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* INFORME DETALLADO DE RENTAS (TABLA / TARJETAS) */}
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportHeaderLeft}>
                <Ionicons name="document-text-outline" size={20} color="#F59E0B" />
                <Text style={styles.reportTitle}>Informe Detallado de Rentas</Text>
              </View>
              <Text style={styles.reportCountBadge}>{rentals.length} registros</Text>
            </View>

            <View style={styles.rentalsList}>
              {rentals.map((rental) => {
                const timeInfo = getRemainingRentalTime(rental.return_due_at);
                const isActive = rental.status === 'activa' && !timeInfo.isExpired;

                return (
                  <View key={rental.id} style={styles.rentalRowCard}>
                    {/* Poster miniatura */}
                    <Image
                      source={{ uri: rental.movie_poster || 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=200' }}
                      style={styles.rentalRowPoster}
                    />

                    {/* Datos principales de la renta */}
                    <View style={styles.rentalRowContent}>
                      <View style={styles.rentalRowTop}>
                        <Text style={styles.rentalRowMovieTitle} numberOfLines={1}>
                          {rental.movie_title}
                        </Text>
                        <View
                          style={[
                            styles.badgePill,
                            isActive ? styles.badgePillActive : styles.badgePillExpired,
                          ]}>
                          <Text
                            style={[
                              styles.badgePillText,
                              isActive ? styles.badgePillTextActive : styles.badgePillTextExpired,
                            ]}>
                            {isActive ? 'Activa' : 'Vencida'}
                          </Text>
                        </View>
                      </View>

                      {/* Usuario que rentó */}
                      <View style={styles.userDataRow}>
                        <Ionicons name="person-circle-outline" size={14} color="#38BDF8" />
                        <Text style={styles.userNameText}>{rental.user_name}</Text>
                        <Text style={styles.userEmailText}>({rental.user_email})</Text>
                      </View>

                      {/* Fechas de inicio y fin (3 días) */}
                      <View style={styles.dateDataRow}>
                        <View style={styles.dateBlock}>
                          <Text style={styles.dateLabel}>Inicio (Renta):</Text>
                          <Text style={styles.dateValue}>{formatRentalDate(rental.rented_at)}</Text>
                        </View>

                        <View style={styles.dateBlock}>
                          <Text style={styles.dateLabel}>Fin (3 días):</Text>
                          <Text style={[styles.dateValue, isActive && styles.dueDateActive]}>
                            {formatRentalDate(rental.return_due_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      ) : (
        /* CONTENIDO 2: GESTIÓN DE PELÍCULAS */
        <View style={styles.sectionWrapper}>
          <View style={styles.catalogTopBar}>
            <View>
              <Text style={styles.catalogTopTitle}>Catálogo de Películas</Text>
              <Text style={styles.catalogTopSubtitle}>
                Agrega nuevas entregas o elimina títulos del catálogo
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addMovieButton}
              onPress={() => setShowAddModal(true)}>
              <Ionicons name="add-circle" size={18} color="#FFF" />
              <Text style={styles.addMovieButtonText}>Agregar Película</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de películas con acción de eliminar */}
          <View style={styles.catalogList}>
            {movies.map((movie) => (
              <View key={movie.id} style={styles.movieManageCard}>
                <Image source={{ uri: movie.poster_url }} style={styles.movieManagePoster} />
                
                <View style={styles.movieManageDetails}>
                  <Text style={styles.movieManageTitle}>{movie.title}</Text>
                  <Text style={styles.movieManageTitleEs}>{movie.title_es}</Text>
                  
                  <View style={styles.movieManageMeta}>
                    <Text style={styles.metaPill}>{movie.release_year}</Text>
                    <Text style={styles.metaPill}>{movie.duration}</Text>
                    <Text style={styles.metaPillGenre} numberOfLines={1}>
                      {movie.genre}
                    </Text>
                  </View>
                </View>

                {/* Botón de Eliminar */}
                <TouchableOpacity
                  style={styles.deleteMovieBtn}
                  onPress={() => handleDeleteMoviePrompt(movie.id, movie.title)}>
                  <Ionicons name="trash-bin-outline" size={18} color="#EF4444" />
                  <Text style={styles.deleteMovieBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Modal para Agregar Película */}
      <AddMovieModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
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
  unauthorizedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#0A0A0C',
  },
  unauthorizedTitle: {
    color: '#EF4444',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  unauthorizedText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  headerSection: {
    width: '100%',
    maxWidth: 680,
    marginBottom: 18,
  },
  badgeAdminRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#991B1B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabsContainer: {
    width: '100%',
    maxWidth: 680,
    flexDirection: 'row',
    backgroundColor: '#16171E',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#E50914',
  },
  tabBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionWrapper: {
    width: '100%',
    maxWidth: 680,
    gap: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#15161D',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262734',
  },
  kpiIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  kpiValueSpecial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#15161D',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262734',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  barsList: {
    gap: 12,
  },
  barItem: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barMovieName: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  barMovieCount: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#20222D',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  reportCard: {
    backgroundColor: '#15161D',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262734',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reportCountBadge: {
    fontSize: 11,
    color: '#9CA3AF',
    backgroundColor: '#20222D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rentalsList: {
    gap: 12,
  },
  rentalRowCard: {
    flexDirection: 'row',
    backgroundColor: '#1C1D26',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2C2E3C',
    gap: 12,
  },
  rentalRowPoster: {
    width: 50,
    height: 75,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  rentalRowContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rentalRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rentalRowMovieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    paddingRight: 8,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgePillExpired: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgePillTextActive: {
    color: '#34D399',
  },
  badgePillTextExpired: {
    color: '#9CA3AF',
  },
  userDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  userEmailText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  dateDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#14151B',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  dateValue: {
    fontSize: 10,
    color: '#E5E7EB',
    fontWeight: '500',
    marginTop: 1,
  },
  dueDateActive: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  catalogTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catalogTopTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  catalogTopSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  addMovieButton: {
    backgroundColor: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addMovieButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  catalogList: {
    gap: 12,
  },
  movieManageCard: {
    flexDirection: 'row',
    backgroundColor: '#15161D',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#262734',
    alignItems: 'center',
    gap: 12,
  },
  movieManagePoster: {
    width: 50,
    height: 75,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  movieManageDetails: {
    flex: 1,
  },
  movieManageTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  movieManageTitleEs: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  movieManageMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  metaPill: {
    fontSize: 10,
    color: '#D1D5DB',
    backgroundColor: '#21232F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaPillGenre: {
    fontSize: 10,
    color: '#F87171',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 120,
  },
  deleteMovieBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteMovieBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
