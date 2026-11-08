import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ConfigException } from '../config.exception';
import { sharedConfigFactory } from '../shared.config';

const valid = {
  NODE_ENV: 'test',
  PORT: '3333',
  JWT_SECRET: 'secret',
  JWT_EXPIRATION_IN: '1d',
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  WEB_ORIGIN: 'http://localhost:4200',
  MAIL_HOST: 'localhost',
  MAIL_PORT: '1025',
  MAIL_FROM: 'no-reply@umbrielship.local',
};

const original = { ...process.env };

const load = (override: Record<string, string | undefined> = {}) => {
  for (const key of Object.keys(valid)) delete process.env[key];
  delete process.env.MAIL_USER;
  delete process.env.MAIL_PASS;
  for (const [key, value] of Object.entries({ ...valid, ...override })) {
    if (value !== undefined) process.env[key] = value;
  }

  return sharedConfigFactory();
};

describe('sharedConfigFactory', () => {
  beforeEach(() => undefined);

  afterEach(() => {
    process.env = { ...original };
  });

  it('[C63] accepts redis and rediss URLs, the web origin and the mail settings', () => {
    const config = load();

    expect(config.redis.url).toBe('redis://localhost:6379');
    expect(config.web.origin).toBe('http://localhost:4200');
    expect(config.mail).toEqual({
      host: 'localhost',
      port: 1025,
      from: 'no-reply@umbrielship.local',
      user: undefined,
      pass: undefined,
    });
    expect(load({ REDIS_URL: 'rediss://r.example:6380' }).redis.url).toBe(
      'rediss://r.example:6380',
    );
    expect(load({ MAIL_USER: 'u', MAIL_PASS: 'p' }).mail).toMatchObject({
      user: 'u',
      pass: 'p',
    });
  });

  it.each(['REDIS_URL', 'WEB_ORIGIN', 'MAIL_HOST', 'MAIL_PORT', 'MAIL_FROM'])(
    '[C63] throws ConfigException when %s is missing',
    (name) => {
      expect(() => load({ [name]: undefined })).toThrow(ConfigException);
    },
  );

  it('[C63] throws ConfigException for a REDIS_URL that is not redis:// or rediss:// and a MAIL_PORT that is not a number', () => {
    expect(() => load({ REDIS_URL: 'http://x' })).toThrow(ConfigException);
    expect(() => load({ MAIL_PORT: 'abc' })).toThrow(ConfigException);
  });
});
