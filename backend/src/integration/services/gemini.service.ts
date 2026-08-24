import { logger } from '../../config/logger';

export class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * Synthesize marine intelligence context into explainable analysis using Gemini
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
3. Use language like "Possible Identification", "Human verification recommended", and "Recurring relationship in available evidence".
4. Return ONLY valid JSON in your response matching this exact structure:
{
  "answer": "Clear markdown explanation",
  "riskRating": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": 0.88,
  "evidence": ["Fact 1", "Fact 2"],
  "whyFlagged": "Explainable reason why flagged",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const userPrompt = `Operator Query: "${query}"
Context Data: ${JSON.stringify(contextData)}

Analyze this operational situation and return the JSON object.`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
        logger.error(`Gemini API error [HTTP ${response.status}]: ${errorText}`);
        throw new Error(`Gemini API request failed [HTTP ${response.status}]: ${errorText}`);
      }

      const data: any = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error('Gemini API returned empty text response.');
      }

      try {
        return JSON.parse(textResponse);
      } catch (parseErr) {
        return {
          answer: textResponse,
          riskRating: 'MEDIUM',
          confidenceScore: 0.85,
          whyFlagged: 'Gemini direct synthesis completed.',
          recommendations: ['Verify field evidence with coastal patrol.']
        };
      }
    } catch (err: any) {
      logger.error('Failed to execute Gemini API call:', err);
      throw err;
    }
  }
}
