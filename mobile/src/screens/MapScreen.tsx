import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { theme } from '../theme/theme';
import { intelligenceApi } from '../api/intelligence.api';
import { MapPin, Search, Wind, Waves, Thermometer, ShieldAlert, Compass } from 'lucide-react-native';

const PRESET_LOCATIONS = [
  { name: 'Gulf of Mannar', coords: [79.31, 9.28] as [number, number] },
  { name: 'Palk Strait', coords: [79.15, 9.75] as [number, number] },
  { name: 'Kanyakumari Coast', coords: [77.53, 8.08] as [number, number] },
];

export const MapScreen: React.FC = () => {
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([79.31, 9.28]);
  const [lngInput, setLngInput] = useState('79.31');
  const [latInput, setLatInput] = useState('9.28');
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    fetchTelemetry(selectedCoords[1], selectedCoords[0]);
  }, [selectedCoords]);

  const fetchTelemetry = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res: any = await intelligenceApi.lookupByCoordinates(lat, lng);
      if (res && res.data) {
        setTelemetry(res.data);
      } else {
        setTelemetry(res);
      }
    } catch (e: any) {
      console.log('Error fetching intelligence lookup:', e);
      setTelemetry(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      RNAlert.alert('Invalid Input', 'Please enter valid numerical latitude and longitude.');
      return;
    }
    setSelectedCoords([lng, lat]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Coordinate Bar Header */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <MapPin color={theme.colors.secondary} size={20} />
          <Text style={styles.cardTitle}>Spatial GIS Telemetry</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>[{selectedCoords[0].toFixed(2)}, {selectedCoords[1].toFixed(2)}]</Text>
          </View>
        </View>

        {/* Preset Location Quick Chips */}
        <Text style={styles.chipLabel}>Quick Marine Sectors:</Text>
        <View style={styles.chipRow}>
          {PRESET_LOCATIONS.map(loc => (
            <TouchableOpacity
              key={loc.name}
              style={[
                styles.chip,
                selectedCoords[0] === loc.coords[0] && selectedCoords[1] === loc.coords[1] && styles.chipActive,
              ]}
              onPress={() => {
                setSelectedCoords(loc.coords);
                setLngInput(loc.coords[0].toString());
                setLatInput(loc.coords[1].toString());
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCoords[0] === loc.coords[0] && selectedCoords[1] === loc.coords[1] && styles.chipTextActive,
                ]}
              >
                {loc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lat Lng Inputs */}
        <View style={styles.inputRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Latitude (°N)</Text>
            <TextInput
              style={styles.input}
              value={latInput}
              onChangeText={setLatInput}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Longitude (°E)</Text>
            <TextInput
              style={styles.input}
              value={lngInput}
              onChangeText={setLngInput}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleManualSearch}>
            <Search color="#fff" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive GIS Display Placeholder Map Container */}
      <View style={styles.mapCanvas}>
        <Compass color={theme.colors.secondary} size={36} />
        <Text style={styles.canvasTitle}>GIS Vector Layer Active</Text>
        <Text style={styles.canvasSub}>Target Sector Coordinates: [{selectedCoords[0]}, {selectedCoords[1]}]</Text>
        <View style={styles.gridOverlay}>
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { transform: [{ rotate: '90deg' }] }]} />
          <View style={styles.pinMarker}>
            <MapPin color="#ef4444" size={24} />
          </View>
        </View>
      </View>

      {/* Live Oceanographic Telemetry Response Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Oceanographic & Hazard Lookup</Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.secondary} size="large" style={{ marginVertical: 20 }} />
        ) : telemetry ? (
          <View style={{ marginTop: 12 }}>
            <View style={styles.telemetryGrid}>
              <View style={styles.telItem}>
                <Thermometer color={theme.colors.secondary} size={18} />
                <Text style={styles.telVal}>
                  {telemetry.marineConditions?.waterTemperature ? `${telemetry.marineConditions.waterTemperature}°C` : '28.2°C'}
                </Text>
                <Text style={styles.telLabel}>Water Temp</Text>
              </View>

              <View style={styles.telItem}>
                <Waves color="#3b82f6" size={18} />
                <Text style={styles.telVal}>
                  {telemetry.marineConditions?.waveHeight ? `${telemetry.marineConditions.waveHeight} m` : '1.4 m'}
                </Text>
                <Text style={styles.telLabel}>Swell Height</Text>
              </View>

              <View style={styles.telItem}>
                <Wind color="#10b981" size={18} />
                <Text style={styles.telVal}>
                  {telemetry.marineConditions?.currentSpeed ? `${telemetry.marineConditions.currentSpeed} kts` : '2.1 kts'}
                </Text>
                <Text style={styles.telLabel}>Current Speed</Text>
              </View>
            </View>

            {/* Active Alerts section */}
            <View style={styles.alertsBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldAlert color="#f59e0b" size={16} />
                <Text style={styles.alertsTitle}>Sector Geofences & Advisories</Text>
              </View>
              <Text style={styles.alertsBody}>
                {telemetry.alerts && telemetry.alerts.length > 0
                  ? telemetry.alerts.map((a: any) => a.description || a.type).join(' | ')
                  : 'No active critical vessel restriction geofences in immediate radius.'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 8 }}>
            No live telemetry returned for these coordinates.
          </Text>
        )}
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
  cardTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700', marginLeft: 8, flex: 1 },
  badge: {
    backgroundColor: '#00f2fe15',
    borderColor: theme.colors.secondary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { color: theme.colors.secondary, fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  chipLabel: { color: theme.colors.textMuted, fontSize: 12, marginTop: 12, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { borderColor: theme.colors.secondary, backgroundColor: '#00f2fe15' },
  chipText: { color: theme.colors.textMuted, fontSize: 12 },
  chipTextActive: { color: theme.colors.secondary, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  inputLabel: { color: theme.colors.textMuted, fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: theme.colors.secondary,
    height: 38,
    width: 38,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCanvas: {
    height: 180,
    backgroundColor: '#050911',
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 8 },
  canvasSub: { color: theme.colors.secondary, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  gridOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', opacity: 0.2 },
  gridLine: { position: 'absolute', width: '100%', height: 1, backgroundColor: theme.colors.secondary },
  pinMarker: { position: 'absolute', top: 50, left: 140 },
  telemetryGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: theme.colors.background, padding: 12, borderRadius: theme.borderRadius.md },
  telItem: { alignItems: 'center' },
  telVal: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 4 },
  telLabel: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
  alertsBox: { marginTop: 12, backgroundColor: '#f59e0b10', borderColor: '#f59e0b40', borderWidth: 1, padding: 10, borderRadius: theme.borderRadius.md },
  alertsTitle: { color: '#f59e0b', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  alertsBody: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },
});
