import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface AppHeaderProps {
  currentTab: 'movies' | 'profile' | 'admin';
  onSelectTab: (tab: 'movies' | 'profile' | 'admin') => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentTab, onSelectTab }) => {
  const { user, signOut, switchDemoRole } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.innerHeader}>
        {/* Logo de la App */}
        <TouchableOpacity style={styles.brandRow} onPress={() => onSelectTab('movies')}>
          <View style={styles.logoBox}>
            <Ionicons name="film" size={18} color="#E50914" />
          </View>
          <View>
            <Text style={styles.brandText}>THE PURGE</Text>
            <Text style={styles.brandTag}>RENTAL PLATFORM</Text>
          </View>
        </TouchableOpacity>

        {/* Acciones de Usuario y Rol en el Header */}
        <View style={styles.userSection}>
          {/* Botón rápido para alternar rol en evaluación */}
          <TouchableOpacity
            style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser]}
            onPress={() => switchDemoRole(isAdmin ? 'user' : 'admin')}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.roleBadgeText}>
              {isAdmin ? 'ADMIN' : 'USUARIO'} ⇄
            </Text>
          </TouchableOpacity>

          {/* Avatar del usuario con acceso directo al Perfil */}
          <TouchableOpacity style={styles.avatarButton} onPress={() => onSelectTab('profile')}>
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menú de Navegación Principal */}
      <View style={styles.navMenu}>
        <TouchableOpacity
          style={[styles.menuItem, currentTab === 'movies' && styles.menuItemActive]}
          onPress={() => onSelectTab('movies')}>
          <Ionicons
            name={currentTab === 'movies' ? 'film' : 'film-outline'}
            size={18}
            color={currentTab === 'movies' ? '#E50914' : '#9CA3AF'}
          />
          <Text style={[styles.menuItemText, currentTab === 'movies' && styles.menuItemTextActive]}>
            Películas (The Purge)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, currentTab === 'profile' && styles.menuItemActive]}
          onPress={() => onSelectTab('profile')}>
          <Ionicons
            name={currentTab === 'profile' ? 'person' : 'person-outline'}
            size={18}
            color={currentTab === 'profile' ? '#E50914' : '#9CA3AF'}
          />
          <Text style={[styles.menuItemText, currentTab === 'profile' && styles.menuItemTextActive]}>
            Mi Perfil
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.menuItem, currentTab === 'admin' && styles.menuItemActiveAdmin]}
            onPress={() => onSelectTab('admin')}>
            <Ionicons
              name={currentTab === 'admin' ? 'shield-checkmark' : 'shield-outline'}
              size={18}
              color={currentTab === 'admin' ? '#EF4444' : '#9CA3AF'}
            />
            <Text style={[styles.menuItemText, currentTab === 'admin' && styles.menuItemTextActive]}>
              Administrador
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#121319',
    borderBottomWidth: 1,
    borderBottomColor: '#252632',
    paddingTop: 12,
  },
  innerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  brandText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  brandTag: {
    color: '#9CA3AF',
    fontSize: 9,
    letterSpacing: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
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
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E50914',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  navMenu: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: '#0D0E13',
    borderTopWidth: 1,
    borderTopColor: '#1F202B',
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  menuItemActive: {
    borderBottomColor: '#E50914',
  },
  menuItemActiveAdmin: {
    borderBottomColor: '#EF4444',
  },
  menuItemText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  menuItemTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
