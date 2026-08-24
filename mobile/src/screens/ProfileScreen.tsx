import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const ProfileScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Officer Identity</Text>
    <Text style={styles.subtitle}>Organization Boundary & Security Preferences</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.bold },
  subtitle: { color: theme.colors.textMuted, fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.xs },
});
