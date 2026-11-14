import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useMovies } from '@/context/MoviesContext';
import { formatRentalDate, getRemainingRentalTime } from '@/utils/dateUtils';

export const ProfileScreen: React.FC = () => {
  const { user, signOut, switchDemoRole } = useAuth();
  const { myRentals } = useMovies();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Tarjeta de Perfil Principal */}
      <View style={styles.profileCard}>
        {/* Fotografía de Perfil y Badges */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person'}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.roleBadgeText}>
                {isAdmin ? 'ADMINISTRADOR' : 'USUARIO'}
              </Text>
            </View>
          </View>

          {/* Nombre y Correo */}
          <Text style={styles.fullNameText}>{user.full_name}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>

        {/* Datos Personales: Edad */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
            <View>
              <Text style={styles.infoBoxLabel}>Edad</Text>
              <Text style={styles.infoBoxValue}>{user.age} años</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="film-outline" size={18} color="#E50914" />
            <View>
              <Text style={styles.infoBoxLabel}>Mis Rentas</Text>
              <Text style={styles.infoBoxValue}>{myRentals.length} películas</Text>
            </View>
          </View>
        </View>

        {/* TARJETA DE CRÉDITO FICTICIA - Con dígitos cifrados y últimos 4 visibles */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeaderTitle}>MÉTODO DE PAGO REGISTRADO</Text>

          <View style={styles.creditCardVisual}>
            {/* Top row: Chip y Logo */}
            <View style={styles.cardTopRow}>
              <View style={styles.chipGraphic}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
              <View style={styles.brandTag}>
                <Ionicons name="radio-outline" size={16} color="#F59E0B" />
                <Text style={styles.brandTagText}>PURGE PAY</Text>
              </View>
            </View>

            {/* Número de Tarjeta Cifrado */}
            <View style={styles.cardNumberContainer}>
              <Text style={styles.cardMaskedDigits}>
                {user.card_number_masked}
              </Text>
              <View style={styles.cipherExplanationBadge}>
                <Ionicons name="lock-closed" size={11} color="#34D399" />
                <Text style={styles.cipherExplanationText}>
                  Dígitos iniciales cifrados • Últimos 4 visibles: ({user.card_last_four})
                </Text>
              </View>
            </View>

            {/* Bottom Row: Titular y Expiración */}
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardHolderLabel}>TITULAR DE LA TARJETA</Text>
                <Text style={styles.cardHolderName} numberOfLines={1}>
                  {user.full_name.toUpperCase()}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardHolderLabel}>VENCE</Text>
                <Text style={styles.cardHolderName}>12/28</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Selector de Rol para Evaluación / Testing */}
        <View style={styles.roleToggleBox}>
          <Text style={styles.roleToggleTitle}>Modo de Prueba (Selector de Rol):</Text>
          <View style={styles.roleButtonsRow}>
            <TouchableOpacity
              style={[styles.roleSwitchBtn, !isAdmin && styles.roleSwitchBtnActive]}
              onPress={() => switchDemoRole('user')}>
              <Text style={[styles.roleSwitchBtnText, !isAdmin && styles.roleSwitchBtnTextActive]}>
                Rol Usuario
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleSwitchBtn, isAdmin && styles.roleSwitchBtnActiveAdmin]}
              onPress={() => switchDemoRole('admin')}>
              <Text style={[styles.roleSwitchBtnText, isAdmin && styles.roleSwitchBtnTextActive]}>
                Rol Administrador
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Historial de Rentas del Usuario */}
      <View style={styles.rentalsSection}>
        <View style={styles.rentalsSectionHeader}>
          <Ionicons name="receipt-outline" size={20} color="#E50914" />
          <Text style={styles.rentalsSectionTitle}>Historial de Mis Rentas</Text>
        </View>

        {myRentals.length === 0 ? (
          <View style={styles.emptyRentalsBox}>
            <Ionicons name="videocam-off-outline" size={36} color="#4B5563" />
            <Text style={styles.emptyRentalsText}>
              No tienes películas rentadas actualmente.
            </Text>
          </View>
        ) : (
          myRentals.map((rental) => {
            const timeInfo = getRemainingRentalTime(rental.return_due_at);
            const isActive = rental.status === 'activa' && !timeInfo.isExpired;

            return (
              <View key={rental.id} style={styles.rentalItemCard}>
                <Image
                  source={{ uri: rental.movie_poster || 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400' }}
                  style={styles.rentalPoster}
                />
                <View style={styles.rentalDetailsCol}>
                  <Text style={styles.rentalMovieTitle}>{rental.movie_title}</Text>
                  
                  <View style={styles.rentalDatesCol}>
                    <Text style={styles.rentalDateText}>
                      📅 Rentada: {formatRentalDate(rental.rented_at)}
                    </Text>
                    <Text style={[styles.rentalDateText, isActive && styles.rentalDueTextActive]}>
                      ⏳ Vence (3 días): {formatRentalDate(rental.return_due_at)}
                    </Text>
                  </View>

                  <View style={styles.rentalStatusBadgeRow}>
                    <View
                      style={[
                        styles.statusBadgeSmall,
                        isActive ? styles.statusActive : styles.statusExpired,
                      ]}>
                      <Text
                        style={[
                          styles.statusBadgeSmallText,
                          isActive ? styles.statusTextActive : styles.statusTextExpired,
                        ]}>
                        {isActive ? `Activa (${timeInfo.text})` : 'Renta finalizada'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
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
  profileCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#15161D',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262734',
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#E50914',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeUser: {
    backgroundColor: '#0284C7',
  },
  roleBadgeAdmin: {
    backgroundColor: '#DC2626',
  },
  roleBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  fullNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emailText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  infoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C1E26',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2B2D3A',
  },
  infoBoxLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  infoBoxValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cardSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  creditCardVisual: {
    backgroundColor: '#1E1B18',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#78350F',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipGraphic: {
    width: 36,
    height: 26,
    backgroundColor: '#F59E0B',
    borderRadius: 5,
    padding: 3,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 1.5,
    backgroundColor: '#78350F',
    width: '100%',
  },
  brandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTagText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardNumberContainer: {
    marginVertical: 16,
  },
  cardMaskedDigits: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FDFDFD',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cipherExplanationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  cipherExplanationText: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '500',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderLabel: {
    fontSize: 9,
    color: '#A8A29E',
    letterSpacing: 0.8,
  },
  cardHolderName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F5F5F4',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  roleToggleBox: {
    backgroundColor: '#1A1C24',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2C38',
    marginBottom: 16,
  },
  roleToggleTitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '600',
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleSwitchBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#232530',
    borderRadius: 6,
  },
  roleSwitchBtnActive: {
    backgroundColor: '#0284C7',
  },
  roleSwitchBtnActiveAdmin: {
    backgroundColor: '#DC2626',
  },
  roleSwitchBtnText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  roleSwitchBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rentalsSection: {
    width: '100%',
    maxWidth: 520,
  },
  rentalsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rentalsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyRentalsBox: {
    backgroundColor: '#15161D',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262734',
    gap: 10,
  },
  emptyRentalsText: {
    color: '#6B7280',
    fontSize: 13,
  },
  rentalItemCard: {
    flexDirection: 'row',
    backgroundColor: '#15161D',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#262734',
    marginBottom: 10,
    gap: 12,
  },
  rentalPoster: {
    width: 50,
    height: 75,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  rentalDetailsCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rentalMovieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rentalDatesCol: {
    gap: 2,
    marginVertical: 4,
  },
  rentalDateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  rentalDueTextActive: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  rentalStatusBadgeRow: {
    flexDirection: 'row',
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusExpired: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  statusBadgeSmallText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: '#34D399',
  },
  statusTextExpired: {
    color: '#9CA3AF',
  },
});
