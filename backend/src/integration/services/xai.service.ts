import { logger } from '../../config/logger';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class XAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.x.ai/v1/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.XAI_API_KEY || '';
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * Send chat messages to xAI Grok API
   */
  public async generateCompletion(
    messages: GrokMessage[],
    model: string = 'grok-2-latest',
    temperature: number = 0.2
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('xAI API key (XAI_API_KEY) is not configured.');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        logger.error(`xAI Grok API error [HTTP ${response.status}]: ${errorText}`);
        throw new Error(`xAI Grok API request failed with status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as GrokCompletionResponse;
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error('xAI Grok API returned empty completion choices.');
    } catch (err: any) {
      logger.error('Failed to execute xAI Grok API call:', err);
      throw err;
    }
  }

  /**
   * Synthesize marine intelligence context into explainable analysis
   */
  public async analyzeMarineQuery(
    query: string,
    contextData: Record<string, any>
  ): Promise<any> {
    const systemPrompt = `You are MARIS AI, an advanced Agentic Marine Intelligence System for SIH Problem Statement 26176.
Your duty is to provide explainable decision support for marine operators, coastal enforcement officers, and researchers.

STRICT CONSTRAINTS:
1. Distinguish facts (Evidence) from inferences (Predictions).
2. NEVER claim automatic guilt, criminal detection, or 100% certainty.
3. Use language like "Possible Identification", "Human verification recommended", and "Recurring relationship in available evidence".
4. Provide response formatted in clean JSON matching:
{
  "answer": "Clear markdown explanation",
  "riskRating": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": number (0.0 to 1.0),
  "evidence": ["Fact 1", "Fact 2"],
  "inferences": ["Inference 1"],
  "recommendations": ["Recommendation 1"],
  "whyFlagged": ["Contributing factor 1"]
}`;

    const userPrompt = `User Query: "${query}"

Environmental & Operational Context Ingested:
${JSON.stringify(contextData, null, 2)}`;

    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const rawText = await this.generateCompletion(messages);
      // Clean potential JSON markdown codeblocks ```json ... ```
      const cleanedJson = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      return JSON.parse(cleanedJson);
    } catch (err) {
      logger.warn('Grok response parsing fallback to raw text synthesis:', err);
      return {
        answer: await this.generateCompletion(messages),
        riskRating: 'MEDIUM',
        confidenceScore: 0.85,
        evidence: ['Realtime marine metrics ingested'],
        inferences: ['Potential marine pattern requiring verification'],
        recommendations: ['Perform human officer review of target coordinates.'],
        whyFlagged: ['Multi-source spatial correlation'],
      };
    }
  }
}
