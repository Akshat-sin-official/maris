import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { lightTheme } from '../theme/theme';
import { intelligenceApi } from '../api/intelligence.api';
import { Compass, Anchor, MapPin, Calendar, CheckCircle2 } from 'lucide-react-native';

const PUBLIC_PFZ_ZONES = [
  {
    id: 'PFZ-GOA-01',
    region: 'Goa Coastal Waters',
    distance: '12.4 NM from Mormugao Port',
    species: 'Skipjack Tuna, Indian Mackerel',
    validFrom: '2026-08-26 06:00',
    validTo: '2026-08-27 18:00',
    coordinates: [73.80, 15.35],
    depth: '35 m',
  },
  {
    id: 'PFZ-TN-04',
    region: 'Gulf of Mannar Sector 2',
    distance: '8.2 NM from Tuticorin',
    species: 'Yellowfin Tuna, Sardines',
    validFrom: '2026-08-26 00:00',
    validTo: '2026-08-28 00:00',
    coordinates: [79.25, 8.80],
    depth: '42 m',
  },
  {
    id: 'PFZ-KL-02',
    region: 'Kochi Offshore Zone',
    distance: '15.0 NM from Fort Kochi',
    species: 'Anchovy, King Mackerel',
    validFrom: '2026-08-26 06:00',
    validTo: '2026-08-27 12:00',
    coordinates: [76.10, 9.92],
    depth: '48 m',
  },
];

export const PFZScreen: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState(PUBLIC_PFZ_ZONES[0]);
  const [loading, setLoading] = useState(false);
  const [liveOceanData, setLiveOceanData] = useState<any>(null);

  const fetchLivePfzData = async (zone: typeof PUBLIC_PFZ_ZONES[0]) => {
    setSelectedZone(zone);
    setLoading(true);
    try {
      const res: any = await intelligenceApi.lookupByCoordinates(zone.coordinates[1], zone.coordinates[0]);
      if (res && res.data) {
        setLiveOceanData(res.data.marineConditions || res.data);
      }
    } catch {
      // Fallback gracefully if network timeout
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePfzData(PUBLIC_PFZ_ZONES[0]);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Anchor color={lightTheme.colors.primary} size={22} />
          <Text style={styles.cardTitle}>Potential Fishing Zones (PFZ)</Text>
        </View>
        <Text style={styles.cardSub}>
          INCOIS satellite oceanographic advisories pinpointing high-probability fishing grounds
        </Text>
      </View>

      {/* Visual Map Canvas Placeholder */}
      <View style={styles.mapCanvas}>
        <Compass color={lightTheme.colors.primary} size={32} />
        <Text style={styles.canvasTitle}>Public PFZ Spatial Layer Active</Text>
        <Text style={styles.canvasSub}>Zone: {selectedZone.id} • [{selectedZone.coordinates[0]}, {selectedZone.coordinates[1]}]</Text>

        {loading ? (
          <ActivityIndicator color={lightTheme.colors.primary} size="small" style={{ marginTop: 6 }} />
        ) : liveOceanData ? (
          <Text style={styles.liveDataText}>
            SST: {liveOceanData.sst || '28.4°C'} • Swell: {liveOceanData.waveHeight || '0.9m'}
          </Text>
        ) : (
          <View style={styles.zoneMarker}>
            <Anchor color={lightTheme.colors.primary} size={14} />
            <Text style={styles.zoneMarkerText}>{selectedZone.region}</Text>
          </View>
        )}
      </View>

      {/* PFZ Zone List */}
      <Text style={styles.sectionTitle}>Active PFZ Advisories ({PUBLIC_PFZ_ZONES.length})</Text>

      {PUBLIC_PFZ_ZONES.map(zone => (
        <TouchableOpacity
          key={zone.id}
          style={[styles.zoneCard, selectedZone.id === zone.id && styles.zoneCardActive]}
          onPress={() => fetchLivePfzData(zone)}
        >
          <View style={styles.zoneHeader}>
            <Text style={styles.zoneRegion}>{zone.region}</Text>
            <View style={styles.validBadge}>
              <CheckCircle2 color="#10b981" size={12} />
              <Text style={styles.validText}>Active</Text>
            </View>
          </View>

          <Text style={styles.zoneDistance}>{zone.distance} • Depth: {zone.depth}</Text>

          <View style={styles.speciesBox}>
            <Text style={styles.speciesTitle}>Target Species:</Text>
            <Text style={styles.speciesText}>{zone.species}</Text>
          </View>

          <View style={styles.footerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar color={lightTheme.colors.textMuted} size={12} />
              <Text style={styles.timeText}>Valid: {zone.validTo}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin color={lightTheme.colors.primary} size={12} />
              <Text style={styles.coordText}>[{zone.coordinates[0]}, {zone.coordinates[1]}]</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.colors.background },
  content: { padding: lightTheme.spacing.md },
  card: {
    backgroundColor: lightTheme.colors.surface,
    borderColor: lightTheme.colors.border,
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.lg,
    padding: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: lightTheme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  cardSub: { color: lightTheme.colors.textSecondary, fontSize: 12, marginTop: 4 },
  mapCanvas: {
    height: 150,
    backgroundColor: '#0284c710',
    borderColor: '#0284c730',
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  canvasTitle: { color: lightTheme.colors.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 6 },
  canvasSub: { color: lightTheme.colors.primary, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  liveDataText: { color: lightTheme.colors.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 6, backgroundColor: lightTheme.colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  zoneMarker: { flexDirection: 'row', alignItems: 'center', backgroundColor: lightTheme.colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  zoneMarkerText: { color: lightTheme.colors.textPrimary, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  sectionTitle: { color: lightTheme.colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  zoneCard: {
    backgroundColor: lightTheme.colors.surface,
    borderColor: lightTheme.colors.border,
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.sm,
  },
  zoneCardActive: { borderColor: lightTheme.colors.primary, backgroundColor: '#0284c708' },
  zoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zoneRegion: { color: lightTheme.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  validBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b98115', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  validText: { color: '#047857', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  zoneDistance: { color: lightTheme.colors.textMuted, fontSize: 12, marginTop: 2 },
  speciesBox: { marginTop: 8, backgroundColor: lightTheme.colors.card, padding: 8, borderRadius: lightTheme.borderRadius.sm },
  speciesTitle: { color: lightTheme.colors.textMuted, fontSize: 11, fontWeight: '600' },
  speciesText: { color: lightTheme.colors.primary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: lightTheme.colors.border },
  timeText: { color: lightTheme.colors.textMuted, fontSize: 11, marginLeft: 4 },
  coordText: { color: lightTheme.colors.primary, fontSize: 11, fontFamily: 'monospace', marginLeft: 4 },
});
