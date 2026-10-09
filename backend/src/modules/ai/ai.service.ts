import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateDealDto } from './ai.dto.js';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service.js';

type GeminiInteraction = {
  status?: string;
  errors?: Array<{ message?: string }>;
  steps?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  output_image?: { data?: string; mime_type?: string };
};

type GeminiError = { error?: { message?: string } };

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService, private readonly platformSettings: PlatformSettingsService) {}

  async generateDeal(dto: GenerateDealDto) {
    const key = await this.platformSettings.geminiApiKey();
    if (!key) throw new ServiceUnavailableException('Gemini AI is not configured.');
    const model = this.config.get('GEMINI_MODEL', 'gemini-3.8-flash');
    const prompt = [
      'Create one ethical, concise WhatsApp retention offer for a local business.',
      'Never claim guaranteed results. Do not use manipulative urgency. Keep the WhatsApp message under 500 characters.',
      'The owner must review it; do not imply it was sent.',
      `Business: ${dto.businessName}; category: ${dto.category ?? 'local business'}; currency: ${dto.currency ?? 'local currency'}.`,
      `Audience: ${dto.audience}; segment statistics: ${JSON.stringify(dto.stats)}; creative variant: ${dto.variant}.`,
      `Product details supplied by the owner: ${dto.productDetails || 'No specific product details supplied'}.`,
      dto.productImageUrl ? `A product photo is available at ${dto.productImageUrl}. Use it as context and create a matching promotional post caption.` : 'No product photo was supplied.',
      'Use {{name}} exactly once in the WhatsApp message for personalization.',
      'Also write concise marketingCopy, a clear CTA, and a social/WhatsApp postCaption. Return copy only; never send or publish anything.',
      `Contact number to show on the promotional post: ${dto.contactNumber || '+1 234 567 8900'}.`,
    ].join('\n');
    let imageInput: { type: string; data: string; mime_type: string } | null = null;
    if (dto.productImageUrl) {
      const imageResponse = await fetch(dto.productImageUrl, { signal: AbortSignal.timeout(20000) });
      if (!imageResponse.ok) throw new BadGatewayException('The product photo could not be read by AI.');
      const mimeType = imageResponse.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) throw new BadGatewayException('Unsupported product photo format.');
      imageInput = { type: 'image', data: Buffer.from(await imageResponse.arrayBuffer()).toString('base64'), mime_type: mimeType };
    }
    const request: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model,
        input: imageInput ? [{ type: 'text', text: prompt }, imageInput] : prompt,
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
              message: { type: 'string' }, marketingCopy: { type: 'string' }, cta: { type: 'string' }, postCaption: { type: 'string' }, rationale: { type: 'string' },
              maxDiscountHint: { type: 'string' },
            },
            required: ['title', 'discountLabel', 'message', 'marketingCopy', 'cta', 'postCaption', 'rationale', 'maxDiscountHint'],
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
      for (const key of ['title', 'discountLabel', 'message', 'marketingCopy', 'cta', 'postCaption', 'rationale', 'maxDiscountHint']) {
        if (typeof result[key] !== 'string' || !String(result[key]).trim()) throw new Error('Invalid field');
      }
      let generatedPostImage = '';
      if (imageInput) {
        try {
          const visualPrompt = `Create a finished premium 1:1 commercial advertising poster from the uploaded reference photo.
STRICT COMPOSITION RULES:
- Isolate and show exactly ONE hero product/object from the reference.
- Never create a collage, grid, before/after layout, duplicate object, extra product, person, hand, or unrelated prop.
- Preserve the real product identity, shape, color, label, and packaging.
- Use a clean studio-quality background, controlled shadows, generous spacing, and a modern food/fashion campaign aesthetic.
- Add only a short tasteful promotional headline and one small contact line: WhatsApp ${dto.contactNumber || '+1 234 567 8900'}.
- Do not invent a price, discount, logo, website, product feature, or unsupported claim.
- Output must look like a complete social media advertisement, not the original raw upload.`;
          const imageResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, signal: AbortSignal.timeout(90000),
            body: JSON.stringify({ model: this.config.get('GEMINI_IMAGE_MODEL', 'gemini-nano-banana-2.1'), input: [imageInput, { type: 'text', text: visualPrompt }], response_format: { type: 'image', aspect_ratio: '1:1' } }),
          });
          const imagePayload = await imageResponse.json().catch(() => ({})) as GeminiInteraction & GeminiError;
          if (imageResponse.ok) {
            const imageBlock = imagePayload.output_image ?? imagePayload.steps?.flatMap((step) => step.content ?? []).find((content) => content.type === 'image') as { data?: string; mime_type?: string } | undefined;
            if (imageBlock?.data) generatedPostImage = `data:${imageBlock.mime_type ?? 'image/png'};base64,${imageBlock.data}`;
          }
        } catch { /* Copy generation remains usable when image generation is unavailable. */ }
      }
      return { ...result, generatedPostImage, variant: dto.variant, provider: 'gemini', model };
    } catch {
      throw new BadGatewayException('Gemini returned an invalid structured response.');
    }
  }
}
