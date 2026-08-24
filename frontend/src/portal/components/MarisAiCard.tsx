import React from 'react';
import { ShieldAlert, CheckCircle2, Cpu, FileText, Compass } from 'lucide-react';

export interface AiResponsePayload {
  query: string;
  answer: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  reasoningSteps: string[];
  recommendations: string[];
  evidence?: string[];
  sources: {
    name: string;
    type: string;
    timestamp: string;
    confidence: number;
  }[];
  mapContext?: {
    locationName: string;
    coordinates: [number, number];
    radiusKm: number;
  };
}

interface MarisAiCardProps {
  payload: AiResponsePayload;
}

export const MarisAiCard: React.FC<MarisAiCardProps> = ({ payload }) => {
  const riskColors = {
    LOW: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    MEDIUM: { bg: '#fefce8', border: '#fef08a', text: '#a16207' },
    HIGH: { bg: '#fff7ed', border: '#ffedd5', text: '#c2410c' },
    CRITICAL: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  };

  const riskStyle = riskColors[payload.riskRating] || riskColors.LOW;

  // Clean raw answer string if stringified JSON
  const getCleanAnswerText = (rawAnswer: string): string => {
    if (!rawAnswer) return '';
    let text = rawAnswer.trim();
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.answer) return parsed.answer;
      } catch (e) {
        // Fall back to original text
      }
    }
    return text;
  };

  const answerText = getCleanAnswerText(payload.answer);

  // Helper to parse Markdown paragraphs & bold/code styling
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();

          // 1. Heading Level 3 (### Heading)
          if (trimmed.startsWith('###')) {
            const titleText = trimmed.replace(/^###\s*/, '');
            return (
              <h3
                key={lineIdx}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#000000',
                  margin: '8px 0 2px',
                  letterSpacing: '0.01em',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  paddingBottom: '6px',
                }}
              >
                {titleText}
              </h3>
            );
          }

          // 2. Bullet point line (* ... or - ...)
          if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
            const bulletContent = trimmed.replace(/^[*|-]\s*/, '');
            return (
              <div
                key={lineIdx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#fbfcfd',
                  border: '1px solid rgba(0,0,0,0.06)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: 'rgba(0,0,0,0.85)',
                }}
              >
                <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>•</span>
                <div>{parseInlineStyles(bulletContent)}</div>
              </div>
            );
          }

          // 3. Normal paragraph
          return (
            <p
              key={lineIdx}
              style={{
                margin: 0,
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: 'rgba(0,0,0,0.82)',
              }}
            >
              {parseInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to parse **bold text** and `inline code`
  const parseInlineStyles = (text: string) => {
    // Regex matches **bold** or `code`
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} style={{ fontWeight: 600, color: '#000000' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        padding: '26px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header Bar: User Query & Risk Pill */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: riskStyle.bg,
              border: `1px solid ${riskStyle.border}`,
              color: riskStyle.text,
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldAlert size={14} />
            <span>RISK LEVEL: {payload.riskRating}</span>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
            Provenanced Decision Support
          </span>
        </div>

        {/* AI Confidence Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>AI Confidence:</span>
          <div
            style={{
              width: '100px',
              height: '8px',
              backgroundColor: '#f1f5f9',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${payload.confidenceScore * 100}%`,
                height: '100%',
                backgroundColor: payload.confidenceScore > 0.8 ? '#10b981' : '#f59e0b',
                borderRadius: '9999px',
              }}
            />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000000' }}>
            {Math.round(payload.confidenceScore * 100)}%
          </span>
        </div>
      </div>

      {/* User Query Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          backgroundColor: '#fafafa',
          border: '1px solid rgba(0,0,0,0.06)',
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Compass size={16} color="#6b7280" />
        <span>Query: "{payload.query}"</span>
      </div>

      {/* Formatted Answer Body */}
      <div>
        {renderFormattedMarkdown(answerText)}
      </div>

      {/* Attributed Evidence List (If Present) */}
      {payload.evidence && payload.evidence.length > 0 && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <FileText size={15} color="#2563eb" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ATTRIBUTED EVIDENCE & FACT CHECKING
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payload.evidence.map((ev, idx) => (
              <div key={idx} style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.45, paddingLeft: '12px', borderLeft: '2px solid #3b82f6' }}>
                {parseInlineStyles(ev)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Agent Reasoning Trace */}
      {payload.reasoningSteps && payload.reasoningSteps.length > 0 && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Cpu size={15} color="#fa2edf" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              REASONING TRACE & EXPLANATION
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payload.reasoningSteps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'rgba(0,0,0,0.75)' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  STEP {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Decision Support Actions */}
      {payload.recommendations && payload.recommendations.length > 0 && (
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            RECOMMENDED DECISION SUPPORT ACTIONS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payload.recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={16} color="#10b981" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citation Sources Grid */}
      {payload.sources && payload.sources.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            ATTRIBUTED EVIDENCE & SOURCE DATA
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {payload.sources.map((src, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  backgroundColor: '#fbfcfd',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#000000', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{src.name}</span>
                  <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}>{src.type}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.45)' }}>Synced: {src.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
