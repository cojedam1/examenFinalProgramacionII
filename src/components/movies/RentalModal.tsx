import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { calculateRentalDates, formatRentalDate } from '@/utils/dateUtils';

interface RentalModalProps {
  visible: boolean;
  movie: Movie | null;
  onClose: () => void;
  onConfirm: (movieId: string) => Promise<void>;
  isProcessing: boolean;
}

export const RentalModal: React.FC<RentalModalProps> = ({
  visible,
  movie,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const { user } = useAuth();

  if (!movie || !user) return null;

  const { rentedAt, returnDueAt } = calculateRentalDates();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Encabezado */}
          <View style={styles.modalHeader}>
            <View style={styles.titleIconRow}>
              <Ionicons name="film-outline" size={20} color="#E50914" />
              <Text style={styles.modalTitle}>Confirmar Renta de Película</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={isProcessing}>
              <Ionicons name="close-circle" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Información de la Película */}
          <View style={styles.moviePreviewRow}>
            <Image source={{ uri: movie.poster_url }} style={styles.moviePoster} />
            <View style={styles.movieDetails}>
              <Text style={styles.movieTitleText}>{movie.title}</Text>
              <Text style={styles.movieTitleEs}>{movie.title_es}</Text>
              <View style={styles.movieMetaRow}>
                <Text style={styles.metaBadge}>{movie.release_year}</Text>
                <Text style={styles.metaBadge}>{movie.duration}</Text>
              </View>
            </View>
          </View>

          {/* Tarjeta de Resumen de Renta (Cálculo estricto de 3 días) */}
          <View style={styles.rentalSummaryBox}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="calendar" size={14} color="#10B981" />
                <Text style={styles.summaryLabel}>Fecha de Inicio (Renta):</Text>
              </View>
              <Text style={styles.summaryValue}>{formatRentalDate(rentedAt)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="time" size={14} color="#EF4444" />
                <Text style={styles.summaryLabel}>Fecha de Fin (Devolución):</Text>
              </View>
              <Text style={styles.summaryValueDueDate}>{formatRentalDate(returnDueAt)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}>
                <Ionicons name="hourglass-outline" size={14} color="#F59E0B" />
                <Text style={styles.summaryLabel}>Duración de la renta:</Text>
              </View>
              <Text style={styles.durationBadge}>3 DÍAS COMPLETOS (72 HORAS)</Text>
            </View>
          </View>

          {/* Datos de Facturación Ficticia del Usuario */}
          <View style={styles.paymentInfoBox}>
            <Ionicons name="card" size={18} color="#D97706" />
            <View style={styles.paymentTextCol}>
              <Text style={styles.paymentUserText}>Cargado a: {user.full_name}</Text>
              <Text style={styles.paymentCardText}>
                Tarjeta ficticia: {user.card_number_masked}
              </Text>
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isProcessing}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, isProcessing && styles.buttonDisabled]}
              onPress={() => onConfirm(movie.id)}
              disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Rentar Ahora</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#181920',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2F313D',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moviePreviewRow: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#101115',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  movieDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  movieTitleEs: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  movieMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  metaBadge: {
    color: '#D1D5DB',
    backgroundColor: '#21222C',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rentalSummaryBox: {
    backgroundColor: '#101115',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2B36',
    marginBottom: 16,
    gap: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  summaryValue: {
    color: '#F3F4F6',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValueDueDate: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  durationBadge: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#20212B',
  },
  paymentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  paymentTextCol: {
    flex: 1,
  },
  paymentUserText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentCardText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#262732',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1.5,
    backgroundColor: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
