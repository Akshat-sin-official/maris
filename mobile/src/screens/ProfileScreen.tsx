import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { authApi } from '../api/auth.api';
import { setAuthToken, getAuthToken } from '../api/client';
import { socketService } from '../services/socket/socketService';
import { ENV } from '../constants/env';
import { Shield, User as UserIcon, Server, CheckCircle2 } from 'lucide-react-native';

const PRESET_ACCOUNTS = [
  { role: 'CONTROL_ROOM_OPERATOR', name: 'Control Room Operator', email: 'operator@maris.gov.in', password: 'password123' },
  { role: 'COASTAL_OFFICER', name: 'Coastal Patrol Officer', email: 'officer@maris.gov.in', password: 'password123' },
  { role: 'RESEARCHER', name: 'Oceanographic Researcher', email: 'researcher@maris.gov.in', password: 'password123' },
  { role: 'ADMIN', name: 'System Admin', email: 'admin@maris.gov.in', password: 'password123' },
];

export const ProfileScreen: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(getAuthToken());

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    if (!getAuthToken()) {
      setCurrentUser(null);
      return;
    }
    try {
      const res: any = await authApi.getMe();
      if (res && res.data) {
        setCurrentUser(res.data);
      }
    } catch (e) {
      console.log('Error fetching user profile:', e);
    }
  };

  const handleLogin = async (acc: typeof PRESET_ACCOUNTS[0]) => {
    setLoading(true);
    try {
      const res: any = await authApi.login({ email: acc.email, pass: acc.password });
      if (res && res.data && res.data.accessToken) {
        const token = res.data.accessToken;
        setAuthToken(token);
        setActiveToken(token);
        socketService.connect(token);
        setCurrentUser(res.data.user || { name: acc.name, email: acc.email, role: acc.role });
        Alert.alert('Authenticated', `Successfully logged in as ${acc.name}`);
      } else {
        Alert.alert('Authentication Failed', 'Invalid response envelope from server');
      }
    } catch (e: any) {
      Alert.alert('Connection Failed', e.message || 'Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setActiveToken(null);
    socketService.disconnect();
    setCurrentUser(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Officer Identity Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatarBox}>
            <UserIcon color={theme.colors.secondary} size={28} />
          </View>
          <View style={styles.identityInfo}>
            <Text style={styles.userName}>{currentUser ? currentUser.name || currentUser.email : 'Officer (Unauthenticated)'}</Text>
            <Text style={styles.userRole}>{currentUser ? currentUser.role || 'GUEST' : 'CITIZEN / GUEST'}</Text>
          </View>
          {activeToken && <CheckCircle2 color={theme.colors.success || '#10b981'} size={20} />}
        </View>

        {activeToken ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out Officer Session</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Preset Role Quick Login */}
      <Text style={styles.sectionTitle}>Operational Role Credentials</Text>
      <Text style={styles.sectionSub}>Select a pre-configured operational identity to authenticate with live server:</Text>

      {PRESET_ACCOUNTS.map(acc => (
        <TouchableOpacity
          key={acc.email}
          style={[styles.accountCard, currentUser?.email === acc.email && styles.accountCardActive]}
          onPress={() => handleLogin(acc)}
          disabled={loading}
        >
          <View style={styles.accRow}>
            <Shield color={currentUser?.email === acc.email ? theme.colors.secondary : theme.colors.textMuted} size={20} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.accName}>{acc.name}</Text>
              <Text style={styles.accEmail}>{acc.email}</Text>
            </View>
            {loading && currentUser?.email === acc.email ? (
              <ActivityIndicator color={theme.colors.secondary} size="small" />
            ) : (
              <Text style={styles.roleTag}>{acc.role}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}

      {/* System Settings & Server URL */}
      <View style={[styles.card, { marginTop: theme.spacing.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Server color={theme.colors.secondary} size={18} />
          <Text style={styles.cardHeaderTitle}>System Configuration</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>API Base URL:</Text>
          <Text style={styles.infoVal}>{ENV.API_BASE_URL}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Socket Base URL:</Text>
          <Text style={styles.infoVal}>{ENV.SOCKET_URL}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Auth Bearer State:</Text>
          <Text style={styles.infoVal}>{activeToken ? 'TOKEN_ACTIVE' : 'NO_TOKEN'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
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
    backgroundColor: '#00f2fe15',
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: { flex: 1, marginLeft: theme.spacing.md },
  userName: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700' },
  userRole: { color: theme.colors.secondary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  logoutBtn: {
    marginTop: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#ef444420',
    borderColor: '#ef4444',
    borderWidth: 1,
    alignItems: 'center',
  },
  logoutText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: theme.spacing.sm },
  sectionSub: { color: theme.colors.textMuted, fontSize: 12, marginBottom: theme.spacing.md, marginTop: 2 },
  accountCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  accountCardActive: { borderColor: theme.colors.secondary, backgroundColor: '#00f2fe08' },
  accRow: { flexDirection: 'row', alignItems: 'center' },
  accName: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  accEmail: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  roleTag: { color: theme.colors.secondary, fontSize: 10, fontWeight: '700', backgroundColor: '#00f2fe15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cardHeaderTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomColor: theme.colors.border, borderBottomWidth: 0.5 },
  infoLabel: { color: theme.colors.textMuted, fontSize: 12 },
  infoVal: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: '600' },
});
