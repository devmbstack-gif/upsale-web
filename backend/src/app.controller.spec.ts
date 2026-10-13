import { describe, expect, it } from 'vitest';
import { AppService } from './app.service.js';
import type { Connection } from 'mongoose';

describe('AppService', () => {
  it('returns health payload', () => {
    const service = new AppService({ readyState: 1 } as Connection);
    const result = service.getHealth();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('upsale-api');
    expect(result.database).toBe('connected');
  });
});
