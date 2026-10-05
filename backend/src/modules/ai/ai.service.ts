import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateDealDto } from './ai.dto.js';

type GeminiInteraction = {
  status?: string;
  errors?: Array<{ message?: string }>;
  steps?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

type GeminiError = { error?: { message?: string } };

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  async generateDeal(dto: GenerateDealDto) {
    const key = this.config.get<string>('GEMINI_API_KEY');
    if (!key) throw new ServiceUnavailableException('Gemini AI is not configured.');
    const model = this.config.get('GEMINI_MODEL', 'gemini-3.8-flash');
    const prompt = [
      'Create one ethical, concise WhatsApp retention offer for a local business.',
      'Never claim guaranteed results. Do not use manipulative urgency. Keep the WhatsApp message under 500 characters.',
      'The owner must review it; do not imply it was sent.',
      `Business: ${dto.businessName}; category: ${dto.category ?? 'local business'}; currency: ${dto.currency ?? 'local currency'}.`,
      `Audience: ${dto.audience}; segment statistics: ${JSON.stringify(dto.stats)}; creative variant: ${dto.variant}.`,
      'Use {{name}} exactly once in the WhatsApp message for personalization.',
    ].join('\n');
    const request: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model,
        input: prompt,
        store: false,
        generation_config: {
          thinking_level: 'low',
          max_output_tokens: 700,
        },
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' }, discountLabel: { type: 'string' },
              message: { type: 'string' }, rationale: { type: 'string' },
              maxDiscountHint: { type: 'string' },
            },
            required: ['title', 'discountLabel', 'message', 'rationale', 'maxDiscountHint'],
            additionalProperties: false,
          },
        },
      }),
    };
    let response: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await fetch('https://generativelanguage.googleapis.com/v1/interactions', { ...request, signal: AbortSignal.timeout(90000) });
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) break;
      await response.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1500));
    }
    if (!response) throw new BadGatewayException('Gemini did not return a response.');
    const payload = await response.json().catch(() => ({})) as GeminiInteraction & GeminiError;
    if (!response.ok) {
      throw new BadGatewayException(payload?.error?.message ?? 'Gemini rejected the generation request.');
    }
    if (payload.status && payload.status !== 'completed') {
      throw new BadGatewayException(payload.errors?.[0]?.message ?? `Gemini interaction ended with status: ${payload.status}.`);
    }
    const text = payload.steps
      ?.filter((step) => step.type === 'model_output')
      .flatMap((step) => step.content ?? [])
      .filter((content) => content.type === 'text')
      .map((content) => content.text ?? '')
      .join('')
      .trim();
    if (!text) throw new BadGatewayException('Gemini returned an empty response.');
    try {
      const result = JSON.parse(text) as Record<string, unknown>;
      for (const key of ['title', 'discountLabel', 'message', 'rationale', 'maxDiscountHint']) {
        if (typeof result[key] !== 'string' || !String(result[key]).trim()) throw new Error('Invalid field');
      }
      return { ...result, variant: dto.variant, provider: 'gemini', model };
    } catch {
      throw new BadGatewayException('Gemini returned an invalid structured response.');
    }
  }
}
