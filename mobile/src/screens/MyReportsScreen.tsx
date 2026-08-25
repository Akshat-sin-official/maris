import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { theme } from '../theme/theme';
import { syncEngine } from '../sync/syncEngine';
import { SyncQueueItem } from '../storage/types';
import { RefreshCw, Trash2, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react-native';

export const MyReportsScreen: React.FC = () => {
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe(updatedQueue => {
      setQueue(updatedQueue);
      setLastSync(syncEngine.getLastSyncedAt());
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    if (queue.length === 0) {
      RNAlert.alert('Queue Empty', 'There are no pending observations or evidence items to sync.');
      return;
    }
    setSyncing(true);
    try {
      const result = await syncEngine.processQueue();
      if (result.failCount === 0) {
        RNAlert.alert('Sync Complete', `Successfully synced ${result.successCount} items to MARIS backend.`);
      } else {
        RNAlert.alert(
          'Sync Partial',
          `Synced ${result.successCount} items. ${result.failCount} items failed to transmit and remain queued.`
        );
      }
    } catch (e: any) {
      RNAlert.alert('Sync Failed', e.message || 'Network error during queue synchronization.');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearSynced = () => {
    syncEngine.clearSynced();
  };

  const getStatusBadge = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'SYNCED':
        return { color: '#10b981', icon: <CheckCircle2 color="#10b981" size={14} />, text: 'SYNCED' };
      case 'SYNCING':
        return { color: '#3b82f6', icon: <ActivityIndicator color="#3b82f6" size="small" />, text: 'SYNCING' };
      case 'FAILED':
        return { color: '#ef4444', icon: <AlertTriangle color="#ef4444" size={14} />, text: 'FAILED' };
      default:
        return { color: '#f59e0b', icon: <Clock color="#f59e0b" size={14} />, text: 'PENDING' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Layers color={theme.colors.secondary} size={22} />
          <Text style={styles.cardTitle}>Offline Sync Queue</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{queue.length} Queued</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>Local buffer holding field observations and evidence before server transmission</Text>

        {/* Action Controls */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.syncBtn} onPress={handleManualSync} disabled={syncing}>
            {syncing ? (
              <ActivityIndicator color="#090d16" size="small" />
            ) : (
              <>
                <RefreshCw color="#090d16" size={16} style={{ marginRight: 6 }} />
                <Text style={styles.syncBtnText}>Sync Queue Now</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={handleClearSynced}>
            <Trash2 color={theme.colors.textMuted} size={16} />
          </TouchableOpacity>
        </View>

        {lastSync && (
          <Text style={styles.lastSyncText}>Last successful batch sync: {new Date(lastSync).toLocaleTimeString()}</Text>
        )}
      </View>

      {/* Queue Items List */}
      <Text style={styles.sectionTitle}>Queued Submissions ({queue.length})</Text>

      {queue.length === 0 ? (
        <View style={styles.emptyCard}>
          <CheckCircle2 color="#10b981" size={32} />
          <Text style={styles.emptyTitle}>Queue Clean & Up To Date</Text>
          <Text style={styles.emptySub}>All observations submitted on this device have been transmitted to server.</Text>
        </View>
      ) : (
        queue.map(item => {
          const badge = getStatusBadge(item.status);
          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>

                <View style={[styles.statusBadge, { borderColor: badge.color, backgroundColor: `${badge.color}15` }]}>
                  {badge.icon}
                  <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
                </View>
              </View>

              <Text style={styles.itemId}>Item ID: {item.id}</Text>
              <Text style={styles.itemPayload}>
                Category: {item.payload?.category || 'N/A'} • Value: {item.payload?.value || 'N/A'}
              </Text>
              {item.payload?.location?.coordinates && (
                <Text style={styles.coordText}>
                  Coordinates: [{item.payload.location.coordinates[0]}, {item.payload.location.coordinates[1]}]
                </Text>
              )}

              <View style={styles.itemFooter}>
                <Text style={styles.timeText}>Created: {new Date(item.createdAt).toLocaleTimeString()}</Text>
                <Text style={styles.retryText}>Retries: {item.retryCount}</Text>
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
  cardTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginLeft: 8, flex: 1 },
  cardSub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  countBadge: { backgroundColor: '#00f2fe15', borderColor: theme.colors.secondary, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  countText: { color: theme.colors.secondary, fontSize: 11, fontWeight: '700' },
  btnRow: { flexDirection: 'row', marginTop: 14, alignItems: 'center' },
  syncBtn: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    height: 42,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtnText: { color: '#090d16', fontSize: 14, fontWeight: '700' },
  clearBtn: {
    width: 42,
    height: 42,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  lastSyncText: { color: theme.colors.textMuted, fontSize: 11, marginTop: 10 },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: theme.spacing.md },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: 30,
    alignItems: 'center',
  },
  emptyTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptySub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText: { color: theme.colors.textPrimary, fontSize: 10, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
  itemId: { color: theme.colors.textMuted, fontSize: 11, marginTop: 8 },
  itemPayload: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: '600', marginTop: 2 },
  coordText: { color: theme.colors.secondary, fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: theme.colors.border },
  timeText: { color: theme.colors.textMuted, fontSize: 10 },
  retryText: { color: theme.colors.textMuted, fontSize: 10 },
});
