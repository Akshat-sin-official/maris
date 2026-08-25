import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../theme/theme';
import { alertsApi } from '../api/alerts.api';
import { incidentsApi } from '../api/incidents.api';
import { Bell, Info, RefreshCw } from 'lucide-react-native';

const FALLBACK_ADVISORIES = [
  {
    id: 'ADV-101',
    severity: 'CRITICAL',
    title: 'Rough Swell Advisory - Gulf of Mannar',
    description: 'High wave heights exceeding 2.8m expected along coastlines. Fishing vessels advised to return to harbor.',
    validFrom: '2026-08-26 00:00',
    validTo: '2026-08-27 18:00',
    coordinates: [79.31, 9.28],
  },
  {
    id: 'ADV-102',
    severity: 'WARNING',
    title: 'Chlorophyll Bloom & SST Anomaly',
    description: 'Elevated Sea Surface Temperature detected in Palk Bay (29.1°C). Potential coral stress alert.',
    validFrom: '2026-08-25 12:00',
    validTo: '2026-08-28 12:00',
    coordinates: [79.15, 9.75],
  },
  {
    id: 'ADV-103',
    severity: 'INFO',
    title: 'PFZ Fishery Zone Data Updated',
    description: 'INCOIS Potentially Fishing Zone forecast updated. High tuna concentration coordinates published.',
    validFrom: '2026-08-26 06:00',
    validTo: '2026-08-26 23:59',
    coordinates: [77.53, 8.08],
  },
];

export const AlertsScreen: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>(FALLBACK_ADVISORIES);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res: any = await alertsApi.getAlerts();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAlerts(res.data);
      } else {
        const incRes: any = await incidentsApi.getIncidents();
        if (incRes && incRes.data && Array.isArray(incRes.data) && incRes.data.length > 0) {
          setAlerts(incRes.data.map((inc: any) => ({
            id: inc.id || inc._id,
            severity: inc.priority === 'HIGH' ? 'CRITICAL' : inc.priority === 'MEDIUM' ? 'WARNING' : 'INFO',
            title: inc.title,
            description: inc.description || 'Active incident registered in control room.',
            validFrom: inc.createdAt,
            validTo: 'ONGOING',
            coordinates: [79.31, 9.28],
          })));
        }
      }
    } catch (e) {
      console.log('Error fetching live alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      default: return '#00f2fe';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAlerts} tintColor={theme.colors.secondary} />}
    >
      {/* Header */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Bell color={theme.colors.secondary} size={22} />
          <Text style={styles.cardTitle}>Real-time Marine Advisories</Text>
          <TouchableOpacity onPress={fetchAlerts} style={{ marginLeft: 'auto' }}>
            <RefreshCw color={theme.colors.textMuted} size={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardSub}>Severe weather warnings, wave swell alerts, & PFZ notices</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alerts Feed */}
      {loading ? (
        <ActivityIndicator color={theme.colors.secondary} size="large" style={{ marginVertical: 30 }} />
      ) : filteredAlerts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Info color={theme.colors.textMuted} size={28} />
          <Text style={styles.emptyText}>No advisories matching severity filter '{filter}'.</Text>
        </View>
      ) : (
        filteredAlerts.map(item => {
          const sColor = getSeverityColor(item.severity);
          return (
            <View key={item.id} style={[styles.alertCard, { borderLeftColor: sColor }]}>
              <View style={styles.alertHeaderRow}>
                <View style={[styles.sevBadge, { backgroundColor: `${sColor}18`, borderColor: sColor }]}>
                  <Text style={[styles.sevText, { color: sColor }]}>{item.severity}</Text>
                </View>
                <Text style={styles.alertId}>{item.id}</Text>
                {item.coordinates && (
                  <Text style={styles.coordBadge}>[{item.coordinates[0]}, {item.coordinates[1]}]</Text>
                )}
              </View>

              <Text style={styles.alertTitleText}>{item.title}</Text>
              <Text style={styles.alertDesc}>{item.description}</Text>

              <View style={styles.timeRow}>
                <Text style={styles.timeText}>Valid: {item.validFrom} → {item.validTo}</Text>
              </View>
            </View>
          );
        })
      )}
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
  cardTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  cardSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  filterRow: { flexDirection: 'row', marginBottom: theme.spacing.md },
  filterChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: { borderColor: theme.colors.secondary, backgroundColor: '#00f2fe15' },
  filterText: { color: theme.colors.textMuted, fontSize: 12 },
  filterTextActive: { color: theme.colors.secondary, fontWeight: '700' },
  alertCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  alertHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sevBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sevText: { fontSize: 10, fontWeight: '800' },
  alertId: { color: theme.colors.textMuted, fontSize: 11, marginLeft: 8 },
  coordBadge: { color: theme.colors.secondary, fontSize: 11, fontFamily: 'monospace', marginLeft: 'auto' },
  alertTitleText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '700' },
  alertDesc: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 17 },
  timeRow: { marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: theme.colors.border },
  timeText: { color: theme.colors.textMuted, fontSize: 11 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: theme.colors.textMuted, fontSize: 13, marginTop: 8 },
});
