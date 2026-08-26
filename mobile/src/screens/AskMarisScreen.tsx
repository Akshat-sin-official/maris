import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { aiApi as marisAiApi } from '../api/ai.api';
import { Bot, Send, Sparkles, User, FileText, CornerDownRight, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react-native';

interface ParsedAiAnswer {
  answer: string;
  riskRating?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  confidenceScore?: number;
  explanation?: string;
  recommendations?: string[];
  citations?: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  parsedData?: ParsedAiAnswer;
  citations?: string[];
  engine?: string;
  timestamp: string;
}

const PROMPT_SUGGESTIONS = [
  'Is Marina Beach safe to visit today?',
  'What are the sea conditions near Benaulim Coast?',
  'Where are today’s active Potential Fishing Zones (PFZs)?',
];

export const AskMarisScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Welcome. I am MARIS AI, your coastal safety & marine companion. Ask me about beach visit suitability, sea weather, or fishing advisories.',
      engine: 'MARIS-AI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const parseAiResponse = (raw: any): ParsedAiAnswer => {
    if (!raw) return { answer: 'Information unavailable.' };
    let target = raw;

    if (typeof raw === 'string') {
      let cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      try {
        target = JSON.parse(cleaned);
      } catch {
        return { answer: cleaned };
      }
    }

    if (target.data) target = target.data;

    const answerStr = target.answer || target.response || (typeof target === 'string' ? target : JSON.stringify(target));
    const cleanAnswer = typeof answerStr === 'string'
      ? answerStr.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      : JSON.stringify(answerStr);

    return {
      answer: cleanAnswer,
      riskRating: target.risk?.rating || target.riskRating,
      confidenceScore: target.confidence || target.confidenceScore,
      explanation: target.explanation || target.whyFlagged,
      recommendations: target.recommendations || [],
      citations: target.citations || [],
    };
  };

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || query;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!userPrompt) setQuery('');
    setLoading(true);

    try {
      const res: any = await marisAiApi.query({ query: textToSend });
      const parsed = parseAiResponse(res);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: parsed.answer,
        parsedData: parsed,
        citations: parsed.citations,
        engine: 'MARIS-AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `MARIS AI Service: ${e.message || 'Connection timeout or network failure.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderAiFormattedBody = (msg: ChatMessage) => {
    const parsed = msg.parsedData;
    if (!parsed) {
      return <Text style={styles.msgBody}>{msg.text}</Text>;
    }

    const riskColor = parsed.riskRating === 'HIGH' ? '#ef4444' : parsed.riskRating === 'MEDIUM' ? '#f59e0b' : '#10b981';

    // Format paragraphs & bullets cleanly
    const lines = parsed.answer.split('\n').filter(l => l.trim() !== '');

    return (
      <View style={styles.richAiContainer}>
        {/* Risk & Confidence Badge Bar */}
        {parsed.riskRating && (
          <View style={styles.badgeBar}>
            <View style={[styles.riskBadge, { backgroundColor: `${riskColor}15`, borderColor: riskColor }]}>
              {parsed.riskRating === 'HIGH' ? (
                <ShieldAlert color={riskColor} size={14} />
              ) : parsed.riskRating === 'MEDIUM' ? (
                <AlertTriangle color={riskColor} size={14} />
              ) : (
                <ShieldCheck color={riskColor} size={14} />
              )}
              <Text style={[styles.riskBadgeText, { color: riskColor }]}>
                {parsed.riskRating} RISK
              </Text>
            </View>

            {parsed.confidenceScore && (
              <View style={styles.confidenceChip}>
                <CheckCircle2 color={theme.colors.primary} size={12} />
                <Text style={styles.confidenceText}>
                  {Math.round(parsed.confidenceScore * 100)}% Confidence
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Clean Structured Answer Content */}
        <View style={styles.answerTextCard}>
          {lines.map((line, idx) => {
            const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-');
            const cleanLine = line.replace(/^[*•-]\s*/, '').trim();

            if (isBullet) {
              return (
                <View key={idx} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{cleanLine}</Text>
                </View>
              );
            }

            return (
              <Text key={idx} style={styles.msgBodyParagraph}>
                {cleanLine}
              </Text>
            );
          })}
        </View>

        {/* Recommendations / Next Steps Box */}
        {parsed.recommendations && parsed.recommendations.length > 0 && (
          <View style={styles.recsBox}>
            <Text style={styles.recsTitle}>Safety Recommendations:</Text>
            {parsed.recommendations.map((rec, rIdx) => (
              <View key={rIdx} style={styles.recItem}>
                <Text style={styles.recItemBullet}>✓</Text>
                <Text style={styles.recItemText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <Sparkles color={theme.colors.primary} size={20} />
        <Text style={styles.headerTitle}>MARIS AI Assistant</Text>
        <View style={styles.engineBadge}>
          <Text style={styles.engineBadgeText}>MARIS AI</Text>
        </View>
      </View>

      {/* Chat Messages Log */}
      <ScrollView style={styles.messageContainer} contentContainerStyle={{ padding: theme.spacing.md }}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.msgWrapper,
              msg.sender === 'user' ? styles.userWrapper : styles.botWrapper,
            ]}
          >
            <View style={styles.msgHeaderRow}>
              {msg.sender === 'assistant' ? (
                <Bot color={theme.colors.primary} size={16} />
              ) : (
                <User color={theme.colors.textPrimary} size={16} />
              )}
              <Text style={styles.senderName}>{msg.sender === 'user' ? 'Visitor' : 'MARIS AI'}</Text>
              <Text style={styles.timestamp}>{msg.timestamp}</Text>
            </View>

            {/* Formatted Answer Body */}
            {renderAiFormattedBody(msg)}

            {/* Citations Box */}
            {msg.citations && msg.citations.length > 0 && (
              <View style={styles.citationsBox}>
                <View style={styles.citationHeader}>
                  <FileText color={theme.colors.textMuted} size={12} />
                  <Text style={styles.citationsTitle}>Information Sources:</Text>
                </View>
                <View style={styles.citationBadgeGrid}>
                  {msg.citations.map((c, idx) => (
                    <View key={idx} style={styles.citationChip}>
                      <Text style={styles.citationChipText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={styles.loadingText}>Synthesizing marine oceanography...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggested Prompt Chips */}
      <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROMPT_SUGGESTIONS.map((p, i) => (
            <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(p)}>
              <CornerDownRight color={theme.colors.primary} size={12} style={{ marginRight: 4 }} />
              <Text style={styles.suggestionText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask MARIS AI about coastal safety..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()} disabled={loading}>
          <Send color="#fff" size={18} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '700', marginLeft: 8, flex: 1 },
  engineBadge: {
    backgroundColor: '#0284c715',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  engineBadgeText: { color: theme.colors.primary, fontSize: 11, fontWeight: '700' },
  messageContainer: { flex: 1 },
  msgWrapper: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxWidth: '92%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    backgroundColor: '#0284c715',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  botWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  msgHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  senderName: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: '700', marginLeft: 6 },
  timestamp: { color: theme.colors.textMuted, fontSize: 10, marginLeft: 'auto' },
  msgBody: { color: theme.colors.textPrimary, fontSize: 13, lineHeight: 19 },
  msgBodyParagraph: { color: theme.colors.textPrimary, fontSize: 13, lineHeight: 19, marginBottom: 6 },
  richAiContainer: { marginTop: 2 },
  badgeBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  riskBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },
  riskBadgeText: { fontSize: 11, fontWeight: '800', marginLeft: 4 },
  confidenceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  confidenceText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', marginLeft: 4 },
  answerTextCard: { marginTop: 2 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, paddingLeft: 4 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.primary, marginTop: 7, marginRight: 8 },
  bulletText: { color: theme.colors.textPrimary, fontSize: 13, lineHeight: 18, flex: 1 },
  recsBox: { marginTop: 10, backgroundColor: '#0284c708', borderColor: '#0284c725', borderWidth: 1, padding: 10, borderRadius: theme.borderRadius.md },
  recsTitle: { color: theme.colors.primary, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 3 },
  recItemBullet: { color: theme.colors.primary, fontSize: 12, fontWeight: '700', marginRight: 6 },
  recItemText: { color: theme.colors.textPrimary, fontSize: 12, flex: 1, lineHeight: 16 },
  citationsBox: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border },
  citationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  citationsTitle: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  citationBadgeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  citationChip: { backgroundColor: '#f1f5f9', borderColor: theme.colors.border, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 4, marginBottom: 4 },
  citationChipText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '600' },
  loadingWrapper: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md },
  loadingText: { color: theme.colors.textMuted, fontSize: 12, marginLeft: 8 },
  suggestionsContainer: { paddingHorizontal: theme.spacing.md, paddingBottom: 8 },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  suggestionText: { color: theme.colors.textSecondary, fontSize: 11 },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    height: 40,
    width: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
