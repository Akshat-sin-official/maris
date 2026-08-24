import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.brandTitle}>MARIS</Text>
      <Text style={styles.brandSubTitle}>Marine Intelligence & Surveillance</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Mobile application foundation ready.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  brandTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 2,
  },
  brandSubTitle: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  badge: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  badgeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
});
