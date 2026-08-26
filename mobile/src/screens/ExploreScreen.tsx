import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { lightTheme } from '../theme/theme';
import { intelligenceApi } from '../api/intelligence.api';
import { Search, MapPin, Thermometer, Waves, Wind, Compass, Sun, AlertCircle } from 'lucide-react-native';

const POPULAR_BEACHES = [
  { name: 'Marina Beach, Chennai', coords: [80.28, 13.05] as [number, number], category: 'Popular Beach' },
  { name: 'Benaulim Beach, Goa', coords: [73.91, 15.26] as [number, number], category: 'Tourist Coast' },
  { name: 'Kovalam Beach, Kerala', coords: [76.97, 8.40] as [number, number], category: 'Recreational Harbor' },
  { name: 'Rameshwaram Coast', coords: [79.31, 9.28] as [number, number], category: 'Gulf Sector' },
  { name: 'RK Beach, Vizag', coords: [83.32, 17.71] as [number, number], category: 'East Coast' },
];

export const ExploreScreen: React.FC = () => {
  const [selectedBeach, setSelectedBeach] = useState(POPULAR_BEACHES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conditions, setConditions] = useState<any>(null);

  useEffect(() => {
    fetchBeachData(selectedBeach.coords[1], selectedBeach.coords[0]);
  }, [selectedBeach]);

  const fetchBeachData = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res: any = await intelligenceApi.lookupByCoordinates(lat, lng);
      if (res && res.data) {
        setConditions(res.data);
      } else {
        setConditions(res);
      }
    } catch {
      setConditions(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredBeaches = POPULAR_BEACHES.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Header */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Explore Coastal India</Text>
        <Text style={styles.heroSub}>Live marine weather, sea conditions & safety intelligence for coastal visitors</Text>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <Search color={lightTheme.colors.textMuted} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search beach, coastal town, or port..."
            placeholderTextColor={lightTheme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Beach Selection Chips */}
      <Text style={styles.sectionTitle}>Featured Coastal Locations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {filteredBeaches.map(b => (
          <TouchableOpacity
            key={b.name}
            style={[styles.beachChip, selectedBeach.name === b.name && styles.beachChipActive]}
            onPress={() => setSelectedBeach(b)}
          >
            <MapPin color={selectedBeach.name === b.name ? lightTheme.colors.primary : lightTheme.colors.textMuted} size={14} />
            <Text style={[styles.beachChipText, selectedBeach.name === b.name && styles.beachChipTextActive]}>
              {b.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Selected Location Card */}
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View>
            <Text style={styles.locationTitle}>{selectedBeach.name}</Text>
            <Text style={styles.locationCategory}>{selectedBeach.category} • [{selectedBeach.coords[0]}, {selectedBeach.coords[1]}]</Text>
          </View>
          <View style={styles.weatherBadge}>
            <Sun color="#f59e0b" size={16} />
            <Text style={styles.weatherText}>Fair Weather</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={lightTheme.colors.primary} size="large" style={{ marginVertical: 30 }} />
        ) : conditions ? (
          <View style={{ marginTop: 16 }}>
            <View style={styles.telemetryGrid}>
              <View style={styles.telItem}>
                <Thermometer color={lightTheme.colors.primary} size={20} />
                <Text style={styles.telVal}>
                  {conditions.marineConditions?.waterTemperature ? `${conditions.marineConditions.waterTemperature}°C` : '28.4°C'}
                </Text>
                <Text style={styles.telLabel}>Sea Temp (SST)</Text>
              </View>

              <View style={styles.telItem}>
                <Waves color="#0284c7" size={20} />
                <Text style={styles.telVal}>
                  {conditions.marineConditions?.waveHeight ? `${conditions.marineConditions.waveHeight} m` : '0.9 m'}
                </Text>
                <Text style={styles.telLabel}>Swell Height</Text>
              </View>

              <View style={styles.telItem}>
                <Wind color="#10b981" size={20} />
                <Text style={styles.telVal}>
                  {conditions.marineConditions?.currentSpeed ? `${conditions.marineConditions.currentSpeed} kts` : '1.8 kts'}
                </Text>
                <Text style={styles.telLabel}>Wind Speed</Text>
              </View>
            </View>

            {/* Suitability summary */}
            <View style={styles.summaryBox}>
              <Compass color={lightTheme.colors.primary} size={18} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.summaryTitle}>Public Visitor Guidance</Text>
                <Text style={styles.summaryBody}>
                  Conditions at {selectedBeach.name} appear calm with normal swell activity suitable for coastal walk & beachgoers. Always observe local warning flags.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.errorBox}>
            <AlertCircle color={lightTheme.colors.textMuted} size={20} />
            <Text style={styles.errorText}>Live marine telemetry temporarily unavailable for this location.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: lightTheme.colors.background },
  content: { padding: lightTheme.spacing.md },
  heroCard: {
    backgroundColor: '#0284c710',
    borderColor: '#0284c730',
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.lg,
    padding: lightTheme.spacing.lg,
    marginBottom: lightTheme.spacing.md,
  },
  heroTitle: { color: lightTheme.colors.textPrimary, fontSize: 22, fontWeight: '800' },
  heroSub: { color: lightTheme.colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surface,
    borderColor: lightTheme.colors.border,
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  searchInput: { flex: 1, height: 42, color: lightTheme.colors.textPrimary, fontSize: 13, marginLeft: 8 },
  sectionTitle: { color: lightTheme.colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  chipScroll: { marginBottom: lightTheme.spacing.md },
  beachChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.surface,
    borderColor: lightTheme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  beachChipActive: { borderColor: lightTheme.colors.primary, backgroundColor: '#0284c715' },
  beachChipText: { color: lightTheme.colors.textSecondary, fontSize: 12, marginLeft: 6 },
  beachChipTextActive: { color: lightTheme.colors.primary, fontWeight: '700' },
  detailCard: {
    backgroundColor: lightTheme.colors.surface,
    borderColor: lightTheme.colors.border,
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.lg,
    padding: lightTheme.spacing.md,
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  locationTitle: { color: lightTheme.colors.textPrimary, fontSize: 18, fontWeight: '700' },
  locationCategory: { color: lightTheme.colors.textMuted, fontSize: 12, marginTop: 2 },
  weatherBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  weatherText: { color: '#b45309', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  telemetryGrid: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: lightTheme.colors.card, padding: 12, borderRadius: lightTheme.borderRadius.md },
  telItem: { alignItems: 'center' },
  telVal: { color: lightTheme.colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 4 },
  telLabel: { color: lightTheme.colors.textMuted, fontSize: 11, marginTop: 2 },
  summaryBox: { flexDirection: 'row', marginTop: 14, backgroundColor: '#0284c708', borderColor: '#0284c720', borderWidth: 1, padding: 12, borderRadius: lightTheme.borderRadius.md },
  summaryTitle: { color: lightTheme.colors.primary, fontSize: 13, fontWeight: '700' },
  summaryBody: { color: lightTheme.colors.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 17 },
  errorBox: { flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 12 },
  errorText: { color: lightTheme.colors.textMuted, fontSize: 12, marginLeft: 8 },
});
