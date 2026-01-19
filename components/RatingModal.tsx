import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './StarRating';

interface RatingModalProps {
  visible: boolean;
  rideId: string;
  driverName?: string;
  onSubmit: (rating: number, feedback: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function RatingModal({
  visible,
  rideId,
  driverName = 'Driver',
  onSubmit,
  onClose,
  isLoading = false,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [charCount, setCharCount] = useState(0);

  // Debug logging
  React.useEffect(() => {
    if (visible) {
      console.log('RatingModal is now VISIBLE');
      console.log('Ride ID:', rideId);
      console.log('Driver Name:', driverName);
    } else {
      console.log('RatingModal is now HIDDEN');
    }
  }, [visible, rideId, driverName]);

  const handleFeedbackChange = (text: string) => {
    if (text.length <= 500) {
      setFeedback(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please select a rating before submitting.');
      return;
    }

    if (feedback.trim().length < 20) {
      Alert.alert('Feedback Too Short', 'Please provide at least 20 characters of feedback.');
      return;
    }

    if (feedback.trim().length > 500) {
      Alert.alert('Feedback Too Long', 'Feedback must not exceed 500 characters.');
      return;
    }

    try {
      await onSubmit(rating, feedback.trim());
      // Reset form
      setRating(0);
      setFeedback('');
      setCharCount(0);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit rating. Please try again.');
    }
  };

  const getRatingText = () => {
    if (rating === 0) return 'Rate your experience';
    if (rating < 2) return 'Poor';
    if (rating < 3) return 'Fair';
    if (rating < 4) return 'Good';
    if (rating < 4.5) return 'Very Good';
    return 'Excellent';
  };

  const canSubmit = rating > 0 && feedback.trim().length >= 20 && feedback.trim().length <= 500;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Rate Your Ride</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Content Wrapper */}
          <View style={{ flex: 1, minHeight: 0 }}>
            <ScrollView 
              style={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              nestedScrollEnabled={true}
            >
            {/* Driver Name */}
            <Text style={styles.driverName}>How was your ride with {driverName}?</Text>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <StarRating
                value={rating}
                onChange={setRating}
                readOnly={isLoading}
                accessibilityLabel="Rate your experience"
              />
              <Text style={styles.ratingText}>{getRatingText()}</Text>
            </View>

            {/* Feedback Section */}
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Share Your Feedback</Text>
              <Text style={styles.feedbackHint}>Help us improve (20-500 characters)</Text>
              <TextInput
                style={[styles.feedbackInput, isLoading && { opacity: 0.6 }]}
                placeholder="Tell us about your experience..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={5}
                maxLength={500}
                value={feedback}
                onChangeText={handleFeedbackChange}
                editable={!isLoading}
                textAlignVertical="top"
              />
              <View style={styles.charCountContainer}>
                <Text style={[styles.charCount, charCount < 20 && { color: '#d32f2f' }]}>
                  {charCount}/500
                </Text>
                {charCount < 20 && (
                  <Text style={styles.charWarning}>Minimum 20 characters required</Text>
                )}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#1976d2" />
              <Text style={styles.infoText}>
                Your feedback helps drivers improve their service and helps other passengers make informed choices.
              </Text>
            </View>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, isLoading && { opacity: 0.6 }]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '95%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  ratingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#0d4217',
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  feedbackHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
    minHeight: 100,
  },
  charCountContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
  },
  charWarning: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1565c0',
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0d4217',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
