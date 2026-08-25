import { logger } from '../../config/logger';

export class GeminiService {
  private apiKey: string;
  private candidateModels: string[] = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  private sanitizeAnswerText(raw: any): string {
    if (!raw) return '';
    let text = typeof raw === 'string' ? raw.trim() : JSON.stringify(raw);

    // Recursively unwrap nested JSON and strip side quotes
    let depth = 0;
    while (depth < 5 && typeof text === 'string') {
      text = text.trim();
      if (text.startsWith('"') && text.endsWith('"') && text.length > 1) {
        text = text.slice(1, -1).trim();
        depth++;
        continue;
      }
      if (text.startsWith('{') && text.endsWith('}')) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.answer) {
            text = typeof parsed.answer === 'string' ? parsed.answer : JSON.stringify(parsed.answer);
            depth++;
            continue;
          }
        } catch {
          break;
        }
      }
      break;
    }

    return text.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
  }

  /**
   * Synthesize marine intelligence context into explainable analysis using Gemini with model fallback
   */
  public async analyzeMarineQuery(
    query: string,
    contextData: Record<string, any>
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key (GEMINI_API_KEY) is not configured.');
    }

    const systemPrompt = `You are MARIS AI, an advanced Agentic Marine Intelligence System for SIH Problem Statement 26176.
Your duty is to provide explainable decision support for marine operators, coastal enforcement officers, and researchers.

STRICT CONSTRAINTS:
1. Distinguish facts (Evidence) from inferences (Predictions).
2. NEVER claim automatic guilt, criminal detection, or 100% certainty.
3. If query is non-marine / inland (e.g., "is it okay to go to Varanasi tmrw?"), directly clarify that the location is inland, outside coastal/maritime EEZ monitoring bounds, while answering user's general question directly.
4. Return ONLY valid JSON in your response matching this exact structure:
{
  "answer": "Clear markdown explanation",
  "riskRating": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": 0.90,
  "evidence": ["Fact 1", "Fact 2"],
  "whyFlagged": "Explainable reason why flagged",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const userPrompt = `Operator Query: "${query}"
Context Data: ${JSON.stringify(contextData)}

Analyze this operational situation and return the JSON object.`;

    let lastError: any = null;

    for (const modelName of this.candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemPrompt },
                  { text: userPrompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json'
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          logger.warn(`Gemini model ${modelName} returned HTTP ${response.status}: ${errorText}. Trying next candidate model...`);
          lastError = new Error(`Gemini model ${modelName} request failed [HTTP ${response.status}]: ${errorText}`);
          continue;
        }

        const data: any = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
          logger.warn(`Gemini model ${modelName} returned empty text choices. Trying next model...`);
          continue;
        }

        let rawText = textResponse.trim();
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
        }

        let parsed: any = {};
        try {
          parsed = JSON.parse(rawText);
        } catch (parseErr) {
          parsed = { answer: rawText };
        }

        const cleanAnswer = this.sanitizeAnswerText(parsed.answer || rawText);

        return {
          answer: cleanAnswer,
          riskRating: parsed.riskRating || 'LOW',
          confidenceScore: parsed.confidenceScore || 0.90,
          evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
          whyFlagged: parsed.whyFlagged || 'Gemini synthesis completed.',
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Verify field evidence with coastal patrol.'],
        };
      } catch (err: any) {
        logger.warn(`Error invoking Gemini model ${modelName}:`, err.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini candidate models failed to generate response.');
  }
}
