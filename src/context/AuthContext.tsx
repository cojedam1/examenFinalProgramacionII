import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, UserRole } from '@/types/database';
import { maskCreditCard } from '@/utils/cardUtils';

interface SignUpExtraData {
  fullName: string;
  age: number;
  cardNumber: string; // 15-16 dígitos ficticios
  avatarUrl?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isSupabaseMode: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, data: SignUpExtraData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USERS_KEY = '@the_purge_app:users_v3';
const STORAGE_CURRENT_USER_KEY = '@the_purge_app:current_user_v3';

// Avatar temático de Labradoodle
export const LABRADOODLE_AVATAR =
  'https://images.unsplash.com/photo-1565419971319-5481f568952a?auto=format&fit=crop&w=600&q=80';

// Cuentas demo predeterminadas con datos de tarjeta ficticios cifrados
const DEFAULT_DEMO_USERS: (Profile & { password: string })[] = [
  {
    id: 'b1c2d3e4-0001-4000-8000-000000000001',
    email: 'admin@purge.com',
    password: 'admin123',
    full_name: 'Carlos Alejandro Ojeda (Admin)',
    age: 28,
    card_number_masked: '•••• •••• •••• 9988',
    card_last_four: '9988',
    avatar_url: LABRADOODLE_AVATAR,
    role: 'admin',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1c2d3e4-0002-4000-8000-000000000002',
    email: 'carlos.ojeda@purge.com',
    password: 'user123',
    full_name: 'Carlos Alejandro Ojeda',
    age: 24,
    card_number_masked: '•••• •••• •••• 4532',
    card_last_four: '4532',
    avatar_url: LABRADOODLE_AVATAR,
    role: 'user',
    created_at: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseMode] = useState<boolean>(isSupabaseConfigured);

  // Inicialización de la sesión
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        // Modo Supabase real
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }

        // Listener de cambios de autenticación en Supabase
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user) {
              await fetchSupabaseProfile(session.user.id, session.user.email || '');
            } else {
              setUser(null);
            }
          }
        );

        setIsLoading(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        // Modo Local/AsyncStorage de respaldo para pruebas inmediatas
        const storedUsersRaw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
        if (!storedUsersRaw) {
          await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
        }

        const storedCurrentUserRaw = await AsyncStorage.getItem(STORAGE_CURRENT_USER_KEY);
        if (storedCurrentUserRaw) {
          const parsedUser = JSON.parse(storedCurrentUserRaw);
          setUser(parsedUser);
        } else {
          // Iniciar por defecto con el usuario Carlos para que la app esté lista al abrir
          const defaultUser = DEFAULT_DEMO_USERS[1];
          const { password: _, ...profileOnly } = defaultUser;
          setUser(profileOnly);
          await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profileOnly));
        }
      }
    } catch (error) {
      console.warn('Error inicializando autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupabaseProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Si aún no existe el registro de perfil, usar perfil básico
        const fallbackProfile: Profile = {
          id: userId,
          email,
          full_name: 'Carlos Alejandro Ojeda',
          age: 24,
          card_number_masked: '•••• •••• •••• 4532',
          card_last_four: '4532',
          avatar_url: LABRADOODLE_AVATAR,
          role: 'user',
        };
        setUser(fallbackProfile);
      } else {
        setUser(data as Profile);
      }
    } catch (err) {
      console.error('Error cargando perfil desde Supabase:', err);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchSupabaseProfile(data.user.id, data.user.email || cleanEmail);
          return { success: true };
        }
        return { success: false, error: 'No se pudo obtener el usuario.' };
      } else {
        // Modo local
        const storedUsersRaw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
        const users: (Profile & { password: string })[] = storedUsersRaw
          ? JSON.parse(storedUsersRaw)
          : DEFAULT_DEMO_USERS;

        const foundUser = users.find(
          (u) => u.email.toLowerCase() === cleanEmail && u.password === password
        );

        if (!foundUser) {
          return { success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
        }

        const { password: _, ...profileOnly } = foundUser;
        setUser(profileOnly);
        await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profileOnly));
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Error inesperado al iniciar sesión.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    extraData: SignUpExtraData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const cardInfo = maskCreditCard(extraData.cardNumber);
      const defaultAvatar =
        extraData.avatarUrl?.trim() || LABRADOODLE_AVATAR;
      const role: UserRole = extraData.role || 'user';

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: extraData.fullName.trim(),
              age: extraData.age,
              card_number_masked: cardInfo.masked,
              card_last_four: cardInfo.lastFour,
              avatar_url: defaultAvatar,
              role,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Intentar insertar en la tabla profiles por si el trigger no está activo
          const newProfile: Profile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: extraData.fullName.trim(),
            age: extraData.age,
            card_number_masked: cardInfo.masked,
            card_last_four: cardInfo.lastFour,
            avatar_url: defaultAvatar,
            role,
          };

          await supabase.from('profiles').upsert(newProfile);
          setUser(newProfile);
          return { success: true };
        }
        return { success: false, error: 'Registro completado pero sin usuario.' };
      } else {
        // Modo Local AsyncStorage
        const storedUsersRaw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
        const users: (Profile & { password: string })[] = storedUsersRaw
          ? JSON.parse(storedUsersRaw)
          : [...DEFAULT_DEMO_USERS];

        const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          return { success: false, error: 'Este correo electrónico ya está registrado.' };
        }

        const newProfile: Profile = {
          id: `user-${Date.now()}`,
          email: cleanEmail,
          full_name: extraData.fullName.trim(),
          age: extraData.age,
          card_number_masked: cardInfo.masked,
          card_last_four: cardInfo.lastFour,
          avatar_url: defaultAvatar,
          role,
          created_at: new Date().toISOString(),
        };

        users.push({ ...newProfile, password });
        await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        setUser(newProfile);
        await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newProfile));

        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Error inesperado al registrarse.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      } else {
        await AsyncStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
      setUser(null);
    } catch (err) {
      console.warn('Error al cerrar sesión:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No hay sesión activa' };

    try {
      const updatedProfile: Profile = { ...user, ...updates, updated_at: new Date().toISOString() };

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) {
          return { success: false, error: error.message };
        }
      } else {
        await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedProfile));

        // Actualizar en la lista de usuarios guardados
        const storedUsersRaw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
        if (storedUsersRaw) {
          const users: (Profile & { password?: string })[] = JSON.parse(storedUsersRaw);
          const index = users.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
          }
        }
      }

      setUser(updatedProfile);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Error al actualizar perfil' };
    }
  };

  const switchDemoRole = async (newRole: UserRole) => {
    if (!user) return;
    await updateProfile({ role: newRole });
  };

  const quickDemoLogin = async (role: UserRole) => {
    const demo = role === 'admin' ? DEFAULT_DEMO_USERS[0] : DEFAULT_DEMO_USERS[1];
    const { password: _, ...profileOnly } = demo;
    setUser(profileOnly);
    await AsyncStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profileOnly));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSupabaseMode,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchDemoRole,
        quickDemoLogin,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
