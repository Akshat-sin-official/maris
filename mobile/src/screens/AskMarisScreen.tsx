import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { aiApi as marisAiApi } from '../api/ai.api';
import { Bot, Send, Sparkles, User, FileText, CornerDownRight } from 'lucide-react-native';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
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

  const cleanJsonAnswer = (rawText: string): string => {
    if (!rawText) return '';
    let cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.answer) return parsed.answer;
      if (typeof parsed === 'string') return parsed;
    } catch {
      // Return cleaned string if not pure JSON
    }
    return cleaned;
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
      let answerText = '';
      let citationsList: string[] = [];

      if (res && res.data) {
        answerText = cleanJsonAnswer(res.data.answer || res.data.response || JSON.stringify(res.data));
        citationsList = res.data.citations || [];
      } else if (res && res.answer) {
        answerText = cleanJsonAnswer(res.answer);
        citationsList = res.citations || [];
      } else {
        answerText = cleanJsonAnswer(typeof res === 'string' ? res : JSON.stringify(res));
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answerText || 'Information temporarily unavailable for this query.',
        citations: citationsList,
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

            <Text style={styles.msgBody}>{msg.text}</Text>

            {msg.citations && msg.citations.length > 0 && (
              <View style={styles.citationsBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <FileText color={theme.colors.textMuted} size={12} />
                  <Text style={styles.citationsTitle}>Information Sources:</Text>
                </View>
                {msg.citations.map((c, idx) => (
                  <Text key={idx} style={styles.citationItem}>• {c}</Text>
                ))}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={styles.loadingText}>Retrieving marine intelligence...</Text>
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
    maxWidth: '90%',
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
  msgHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  senderName: { color: theme.colors.textPrimary, fontSize: 12, fontWeight: '700', marginLeft: 6 },
  timestamp: { color: theme.colors.textMuted, fontSize: 10, marginLeft: 'auto' },
  msgBody: { color: theme.colors.textPrimary, fontSize: 13, lineHeight: 18 },
  citationsBox: { marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: theme.colors.border },
  citationsTitle: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  citationItem: { color: theme.colors.primary, fontSize: 11, marginTop: 2 },
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
