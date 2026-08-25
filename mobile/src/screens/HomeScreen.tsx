import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { apiClient } from '../api/client';
import { Eye, Bot, MapPin, Bell, Activity, RefreshCw } from 'lucide-react-native';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res: any = await apiClient.get('/health');
      setHealthStatus(res);
    } catch (e: any) {
      setHealthStatus({ status: 'offline', message: e.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header & Coordinate Badge */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>MARIS</Text>
          <Text style={styles.brandSubTitle}>Marine Intelligence & Patrol Mobile</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>[79.31, 9.28]</Text>
        </View>
      </View>

      {/* Live Server Health Banner */}
      <View style={styles.healthBanner}>
        <View style={styles.healthHeader}>
          <Activity color={theme.colors.secondary} size={18} />
          <Text style={styles.healthTitle}>Operational Node Health</Text>
          <TouchableOpacity onPress={checkHealth} style={styles.refreshBtn}>
            <RefreshCw color={theme.colors.textMuted} size={14} />
          </TouchableOpacity>
        </View>
        {loadingHealth ? (
          <ActivityIndicator color={theme.colors.secondary} size="small" style={styles.loader} />
        ) : healthStatus ? (
          <View style={styles.healthRow}>
            <View style={[styles.statusDot, { backgroundColor: healthStatus.status === 'success' ? '#10b981' : '#ef4444' }]} />
            <Text style={styles.healthStatusText}>
              Backend REST API: {healthStatus.status === 'success' ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
            {healthStatus.services?.database && (
              <Text style={styles.dbText}>
                MongoDB: {healthStatus.services.database.status.toUpperCase()}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.healthStatusText}>Press refresh to check server status</Text>
        )}
      </View>

      {/* Quick Launch Cards */}
      <Text style={styles.sectionTitle}>Quick Operational Actions</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Observe')}>
          <View style={[styles.iconBox, { backgroundColor: '#00f2fe15', borderColor: '#00f2fe' }]}>
            <Eye color="#00f2fe" size={24} />
          </View>
          <Text style={styles.cardTitle}>Field Observe</Text>
          <Text style={styles.cardSub}>Capture marine sightings & tip evidence</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AskMaris')}>
          <View style={[styles.iconBox, { backgroundColor: '#3b82f615', borderColor: '#3b82f6' }]}>
            <Bot color="#3b82f6" size={24} />
          </View>
          <Text style={styles.cardTitle}>Ask MARIS AI</Text>
          <Text style={styles.cardSub}>Agentic Gemini query assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Map')}>
          <View style={[styles.iconBox, { backgroundColor: '#10b98115', borderColor: '#10b981' }]}>
            <MapPin color="#10b981" size={24} />
          </View>
          <Text style={styles.cardTitle}>GIS Live Map</Text>
          <Text style={styles.cardSub}>Spatial marine telemetry lookup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Alerts')}>
          <View style={[styles.iconBox, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b' }]}>
            <Bell color="#f59e0b" size={24} />
          </View>
          <Text style={styles.cardTitle}>Advisories</Text>
          <Text style={styles.cardSub}>Hazard warnings & swell alerts</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Banner */}
      <View style={styles.metricsCard}>
        <Text style={styles.metricsTitle}>Gulf of Mannar Live Telemetry Summary</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>28.4°C</Text>
            <Text style={styles.metricLabel}>Sea Temp (SST)</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>1.2 m</Text>
            <Text style={styles.metricLabel}>Swell Height</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>14</Text>
            <Text style={styles.metricLabel}>AIS Vessels</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  brandTitle: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: 2 },
  brandSubTitle: { color: theme.colors.secondary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  badge: {
    backgroundColor: '#00f2fe15',
    borderColor: theme.colors.secondary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: theme.colors.secondary, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  healthBanner: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  refreshBtn: { marginLeft: 'auto' },
  loader: { marginTop: 8 },
  healthHeader: { flexDirection: 'row', alignItems: 'center' },
  healthTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  healthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  healthStatusText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' },
  dbText: { color: theme.colors.textMuted, fontSize: 11, marginLeft: 'auto' },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: theme.spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '700' },
  cardSub: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4 },
  metricsCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  metricsTitle: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  metricItem: { alignItems: 'center' },
  metricVal: { color: theme.colors.secondary, fontSize: 18, fontWeight: '800' },
  metricLabel: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
});
