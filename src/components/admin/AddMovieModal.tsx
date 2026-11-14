import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMovies } from '@/context/MoviesContext';

interface AddMovieModalProps {
  visible: boolean;
  onClose: () => void;
}

const POSTER_PRESETS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
];

export const AddMovieModal: React.FC<AddMovieModalProps> = ({ visible, onClose }) => {
  const { addMovie } = useMovies();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [releaseYear, setReleaseYear] = useState('2026');
  const [duration, setDuration] = useState('1h 45m');
  const [genre, setGenre] = useState('Terror / Suspenso / Distopía');
  const [synopsis, setSynopsis] = useState('');
  const [posterUrl, setPosterUrl] = useState(POSTER_PRESETS[0]);

  const handleSave = async () => {
    setErrorMsg(null);

    if (!title.trim() || !titleEs.trim() || !synopsis.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    const yearNum = parseInt(releaseYear, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setErrorMsg('Ingresa un año de estreno válido.');
      return;
    }

    setLoading(true);
    const res = await addMovie({
      title: title.trim(),
      title_es: titleEs.trim(),
      release_year: yearNum,
      duration: duration.trim(),
      genre: genre.trim(),
      synopsis: synopsis.trim(),
      poster_url: posterUrl.trim(),
    });
    setLoading(false);

    if (res.success) {
      // Reset form
      setTitle('');
      setTitleEs('');
      setSynopsis('');
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleIconRow}>
              <Ionicons name="film" size={20} color="#E50914" />
              <Text style={styles.modalTitle}>Agregar Nueva Película</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons name="close-circle" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Título Original */}
            <Text style={styles.label}>Título Original (Inglés)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. The Purge: Outbreak"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />

            {/* Título en Español */}
            <Text style={styles.label}>Título en Español</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. La noche de la expiación: Brote"
              placeholderTextColor="#666"
              value={titleEs}
              onChangeText={setTitleEs}
            />

            {/* Año y Duración en fila */}
            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Año de Estreno</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={releaseYear}
                  onChangeText={setReleaseYear}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Duración</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1h 45m"
                  placeholderTextColor="#666"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </View>

            {/* Género */}
            <Text style={styles.label}>Género</Text>
            <TextInput
              style={styles.input}
              placeholder="Terror / Acción / Distopía"
              placeholderTextColor="#666"
              value={genre}
              onChangeText={setGenre}
            />

            {/* Sinopsis */}
            <Text style={styles.label}>Sinopsis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe la trama de la película..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={synopsis}
              onChangeText={setSynopsis}
            />

            {/* URL del Póster */}
            <Text style={styles.label}>URL de la Imagen de Portada (Póster)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#666"
              value={posterUrl}
              onChangeText={setPosterUrl}
            />

            {/* Botones de Acción */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.btnDisabled]}
                onPress={handleSave}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={16} color="#FFF" />
                    <Text style={styles.saveBtnText}>Guardar Película</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#16171E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2F3140',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  formScroll: {
    flexGrow: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1E202A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#2D303E',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#262835',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
