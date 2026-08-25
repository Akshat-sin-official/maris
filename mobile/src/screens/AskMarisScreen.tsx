import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { aiApi as geminiApi } from '../api/ai.api';
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
  'What is the current swell warning near Gulf of Mannar?',
  'Analyze potential illegal trawling risks in Sector 4.',
  'Summarize recent sea surface temperature (SST) anomalies.',
];

export const AskMarisScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Greetings Officer. I am MARIS Agentic AI decision support engine. Ask me about oceanographic conditions, vessel anomalies, or patrol advisories.',
      engine: 'Gemini-3.6-Flash',
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
      const res: any = await geminiApi.query({ query: textToSend });
      let answerText = '';
      let citationsList: string[] = [];
      let engineName = 'GOOGLE_GEMINI_LIVE';

      if (res && res.data) {
        answerText = cleanJsonAnswer(res.data.answer || res.data.response || JSON.stringify(res.data));
        citationsList = res.data.citations || [];
        engineName = res.data.llmEngine || 'GOOGLE_GEMINI_LIVE';
      } else if (res && res.answer) {
        answerText = cleanJsonAnswer(res.answer);
        citationsList = res.citations || [];
      } else {
        answerText = cleanJsonAnswer(typeof res === 'string' ? res : JSON.stringify(res));
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answerText || 'No response returned from Gemini AI engine.',
        citations: citationsList,
        engine: engineName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `AI Assistant Query Error: ${e.message || 'Connection timeout or network failure.'}`,
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
        <Sparkles color={theme.colors.secondary} size={20} />
        <Text style={styles.headerTitle}>MARIS Agentic AI Workspace</Text>
        <View style={styles.engineBadge}>
          <Text style={styles.engineBadgeText}>Gemini Live</Text>
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
                <Bot color={theme.colors.secondary} size={16} />
              ) : (
                <User color={theme.colors.textPrimary} size={16} />
              )}
              <Text style={styles.senderName}>{msg.sender === 'user' ? 'Officer' : 'MARIS AI'}</Text>
              <Text style={styles.timestamp}>{msg.timestamp}</Text>
            </View>

            <Text style={styles.msgBody}>{msg.text}</Text>

            {msg.citations && msg.citations.length > 0 && (
              <View style={styles.citationsBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <FileText color={theme.colors.textMuted} size={12} />
                  <Text style={styles.citationsTitle}>Intel Sources:</Text>
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
            <ActivityIndicator color={theme.colors.secondary} size="small" />
            <Text style={styles.loadingText}>Synthesizing oceanographic intelligence via Gemini AI...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggested Prompt Chips */}
      <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROMPT_SUGGESTIONS.map((p, i) => (
            <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(p)}>
              <CornerDownRight color={theme.colors.secondary} size={12} style={{ marginRight: 4 }} />
              <Text style={styles.suggestionText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask MARIS AI decision support..."
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
    backgroundColor: '#00f2fe15',
    borderColor: theme.colors.secondary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  engineBadgeText: { color: theme.colors.secondary, fontSize: 11, fontWeight: '700' },
  messageContainer: { flex: 1 },
  msgWrapper: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxWidth: '90%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    backgroundColor: '#00f2fe15',
    borderColor: theme.colors.secondary,
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
  citationItem: { color: theme.colors.secondary, fontSize: 11, marginTop: 2 },
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
    backgroundColor: theme.colors.secondary,
    height: 40,
    width: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
