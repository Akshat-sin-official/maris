import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const ObserveScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Field Observation</Text>
    <Text style={styles.subtitle}>Offline-First Observation & Evidence Capture</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold },
  subtitle: { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.xs },
});
