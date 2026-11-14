import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import { cleanCardDigits, formatCardDisplay, maskCreditCard } from '@/utils/cardUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1565419971319-5481f568952a?auto=format&fit=crop&w=600&q=80', // Labradoodle Principal
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80', // Labradoodle Rubio
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80', // Doodle Cachorro
  'https://api.dicebear.com/7.x/bottts/png?seed=CarlosLabradoodle', // Avatar Ilustrado Robot
  'https://api.dicebear.com/7.x/adventurer/png?seed=CarlosOjeda', // Avatar Ilustrado
  'https://api.dicebear.com/7.x/thumbs/png?seed=DoodlePurge', // Avatar Ilustrado Thumbs
];

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, isSupabaseMode } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('24');
  const [rawCardNumber, setRawCardNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const handleCardNumberChange = (text: string) => {
    const cleaned = cleanCardDigits(text);
    setRawCardNumber(cleaned);
  };

  const maskedCardPreview = maskCreditCard(rawCardNumber);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (isRegisterMode) {
      if (!fullName.trim()) {
        setErrorMessage('Por favor ingresa tu nombre completo.');
        return;
      }
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 12 || ageNum > 120) {
        setErrorMessage('Ingresa una edad válida (entre 12 y 120 años).');
        return;
      }
      if (rawCardNumber.length < 15) {
        setErrorMessage('Ingresa un número ficticio de tarjeta de crédito válido (15 o 16 dígitos).');
        return;
      }

      setLoading(true);
      const avatarFinal = customAvatarUrl.trim() || selectedAvatar;
      const res = await signUp(email, password, {
        fullName: fullName.trim(),
        age: ageNum,
        cardNumber: rawCardNumber,
        avatarUrl: avatarFinal,
        role,
      });
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Error al registrar usuario.');
      }
    } else {
      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Credenciales inválidas.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.cardContainer}>
        {/* Encabezado Purge */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="film" size={32} color="#E50914" />
          </View>
          <Text style={styles.brandTitle}>THE PURGE</Text>
          <Text style={styles.brandSubtitle}>PLATAFORMA DE RENTA Y STREAMING</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, isSupabaseMode ? styles.badgeSupabase : styles.badgeLocal]}>
              <Ionicons
                name={isSupabaseMode ? 'cloud-done' : 'laptop-outline'}
                size={12}
                color={isSupabaseMode ? '#10B981' : '#F59E0B'}
              />
              <Text style={[styles.badgeText, { color: isSupabaseMode ? '#10B981' : '#F59E0B' }]}>
                {isSupabaseMode ? 'Supabase Conectado' : 'Modo Demo / Local'}
              </Text>
            </View>
          </View>
        </View>

        {/* Selector Pestañas Iniciar Sesión / Registro */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabButton, !isRegisterMode && styles.tabButtonActive]}
            onPress={() => {
              setIsRegisterMode(false);
              setErrorMessage(null);
            }}>
            <Text style={[styles.tabButtonText, !isRegisterMode && styles.tabButtonTextActive]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, isRegisterMode && styles.tabButtonActive]}
            onPress={() => {
              setIsRegisterMode(true);
              setErrorMessage(null);
            }}>
            <Text style={[styles.tabButtonText, isRegisterMode && styles.tabButtonTextActive]}>
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mensaje de Error */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Campos de Entrada */}
        <View style={styles.formGroup}>
          {isRegisterMode && (
            <>
              {/* Nombre Completo */}
              <Text style={styles.label}>Nombre Completo</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej. Carlos Alejandro Ojeda"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Edad */}
              <Text style={styles.label}>Edad</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej. 25"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  maxLength={3}
                />
              </View>

              {/* Número de Tarjeta de Crédito (Ficticio) */}
              <Text style={styles.label}>Número de Tarjeta de Crédito (Ficticio)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="16 dígitos ficticios (ej. 4532 8899 1234 5678)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formatCardDisplay(rawCardNumber)}
                  onChangeText={handleCardNumberChange}
                  maxLength={19}
                />
              </View>

              {/* Vista previa de cifrado de tarjeta */}
              {rawCardNumber.length > 0 && (
                <View style={styles.cardPreviewBox}>
                  <Text style={styles.cardPreviewLabel}>Cifrado en base de datos:</Text>
                  <Text style={styles.cardPreviewValue}>{maskedCardPreview.masked}</Text>
                  <Text style={styles.cardPreviewHint}>
                    (Primeros 12 dígitos cifrados, últimos 4 visibles: {maskedCardPreview.lastFour})
                  </Text>
                </View>
              )}

              {/* Selector de Avatar de Perfil */}
              <Text style={styles.label}>Avatar de Perfil</Text>
              <View style={styles.avatarRow}>
                {AVATAR_PRESETS.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedAvatar(url);
                      setCustomAvatarUrl('');
                    }}
                    style={[
                      styles.avatarThumbWrapper,
                      selectedAvatar === url && !customAvatarUrl && styles.avatarThumbSelected,
                    ]}>
                    <Image source={{ uri: url }} style={styles.avatarThumb} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Correo Electrónico */}
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Botón Principal */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegisterMode ? 'Completar Registro' : 'Iniciar Sesión'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#0A0A0C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#141418',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#26262E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  badgeRow: {
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeSupabase: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeLocal: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#E50914',
  },
  tabButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    flex: 1,
  },
  formGroup: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: -4,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B22',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2F313D',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 12,
    fontSize: 14,
  },
  cardPreviewBox: {
    backgroundColor: '#1C1917',
    borderWidth: 1,
    borderColor: '#44403C',
    borderRadius: 8,
    padding: 10,
    marginTop: -4,
  },
  cardPreviewLabel: {
    fontSize: 11,
    color: '#A8A29E',
  },
  cardPreviewValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginVertical: 2,
  },
  cardPreviewHint: {
    fontSize: 10,
    color: '#78716C',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  avatarThumbWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#2F313D',
    overflow: 'hidden',
  },
  avatarThumbSelected: {
    borderColor: '#E50914',
    borderWidth: 2.5,
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#1A1B22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F313D',
  },
  roleOptionActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  roleOptionActiveAdmin: {
    backgroundColor: '#991B1B',
    borderColor: '#EF4444',
  },
  roleOptionText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#E50914',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#26262E',
  },
  separatorText: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 1,
  },
  demoButtonsContainer: {
    gap: 10,
  },
  demoButtonUser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
  },
  demoButtonUserText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  demoButtonAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
  },
  demoButtonAdminText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});
