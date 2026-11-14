import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { MoviesListScreen } from '@/components/movies/MoviesListScreen';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AppHeader } from '@/components/layout/AppHeader';

export default function MainAppScreen() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'movies' | 'profile' | 'admin'>('movies');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  // 1. Si no hay sesión activa: Mostrar Inicio de Sesión / Registro
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <AuthScreen />
      </SafeAreaView>
    );
  }

  // 2. Con sesión activa: Mostrar Menú con las opciones (Películas, Perfil, Administrador)
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader currentTab={currentTab} onSelectTab={setCurrentTab} />

      <View style={styles.contentArea}>
        {currentTab === 'movies' && <MoviesListScreen />}
        {currentTab === 'profile' && <ProfileScreen />}
        {currentTab === 'admin' && <AdminDashboard />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
  },
});
