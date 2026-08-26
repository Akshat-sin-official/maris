import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { theme } from '../theme/theme';
import { ENV } from '../constants/env';
import { User, Bell, Globe, Shield, Server, CheckCircle2 } from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const [userName] = useState('Citizen Visitor');
  const [notifications, setNotifications] = useState(true);
  const [language] = useState('English');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatarBox}>
            <User color={theme.colors.primary} size={28} />
          </View>
          <View style={styles.identityInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>Public Coastal Account</Text>
          </View>
          <CheckCircle2 color={theme.colors.success} size={20} />
        </View>
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Account & Safety Preferences</Text>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Bell color={theme.colors.primary} size={18} />
            <Text style={styles.settingText}>Severe Weather Alerts</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingLeft}>
            <Globe color={theme.colors.primary} size={18} />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <Text style={styles.settingVal}>{language}</Text>
        </View>
      </View>

      {/* Privacy & Safety Statement */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Shield color={theme.colors.primary} size={18} />
          <Text style={styles.cardHeaderTitle}>MARIS Privacy Guarantee</Text>
        </View>
        <Text style={styles.privacyBody}>
          The MARIS Citizen Portal preserves user privacy. Anonymous tips submitted through this app generate encrypted pseudonymous receipt IDs and do not track personal identity.
        </Text>
      </View>

      {/* System Server Info */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Server color={theme.colors.primary} size={18} />
          <Text style={styles.cardHeaderTitle}>System Environment</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>API Server Base:</Text>
          <Text style={styles.infoVal}>{ENV.API_BASE_URL}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Portal Mode:</Text>
          <Text style={styles.infoVal}>Citizen Companion (Light)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version:</Text>
          <Text style={styles.infoVal}>v1.0.0 Public</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0284c715',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: { flex: 1, marginLeft: theme.spacing.md },
  userName: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700' },
  userRole: { color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600', marginLeft: 10 },
  settingVal: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },
  cardHeaderTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  privacyBody: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomColor: theme.colors.border, borderBottomWidth: 0.5 },
  infoLabel: { color: theme.colors.textMuted, fontSize: 12 },
  infoVal: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: '600' },
});
