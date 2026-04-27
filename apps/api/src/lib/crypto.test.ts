import { describe, it, expect } from 'vitest';
import {
  generateId,
  hashApiKey,
  generateApiKey,
  encrypt,
  decrypt,
  computeAuditHash,
  generateAgentKeyPair,
} from './crypto.js';

describe('generateId', () => {
  it('should generate an ID with the given prefix', () => {
    const id = generateId('agt');
    expect(id).toMatch(/^agt_/);
    expect(id.length).toBeGreaterThan(5);
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId('tok')));
    expect(ids.size).toBe(100);
  });
});

describe('API Key', () => {
  it('should generate a key starting with ak_live_', () => {
    const { raw, hash } = generateApiKey();
    expect(raw).toMatch(/^ak_live_/);
    expect(hash).toBeTruthy();
    expect(hash).not.toBe(raw); // hash is different from raw
  });

  it('should produce consistent hashes for the same key', () => {
    const key = 'ak_live_test123';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different keys', () => {
    const hash1 = hashApiKey('ak_live_key1');
    const hash2 = hashApiKey('ak_live_key2');
    expect(hash1).not.toBe(hash2);
  });
});

describe('Vault Encryption', () => {
  it('should encrypt and decrypt a secret', () => {
    const secret = 'sk_test_stripe_key_12345';
    const { encrypted, iv } = encrypt(secret);

    expect(encrypted).not.toBe(secret);
    expect(iv).toBeTruthy();

    const decrypted = decrypt(encrypted, iv);
    expect(decrypted).toBe(secret);
  });

  it('should produce different ciphertexts for same plaintext (random IV)', () => {
    const secret = 'same-secret';
    const result1 = encrypt(secret);
    const result2 = encrypt(secret);

    expect(result1.encrypted).not.toBe(result2.encrypted);
    expect(result1.iv).not.toBe(result2.iv);

    // But both should decrypt to the same value
    expect(decrypt(result1.encrypted, result1.iv)).toBe(secret);
    expect(decrypt(result2.encrypted, result2.iv)).toBe(secret);
  });

  it('should fail to decrypt with wrong IV', () => {
    const { encrypted } = encrypt('test-secret');
    const wrongIv = '00'.repeat(16);

    expect(() => decrypt(encrypted, wrongIv)).toThrow();
  });
});

describe('Audit Hash', () => {
  it('should produce a SHA-256 hex hash', () => {
    const hash = computeAuditHash({
      agent_id: 'agt_test',
      action: 'token.create',
      result: 'success',
    });

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should produce different hashes for different inputs', () => {
    const hash1 = computeAuditHash({
      agent_id: 'agt_1',
      action: 'token.create',
      result: 'success',
    });
    const hash2 = computeAuditHash({
      agent_id: 'agt_2',
      action: 'token.create',
      result: 'success',
    });

    expect(hash1).not.toBe(hash2);
  });
});

describe('Agent Key Pair', () => {
  it('should generate a valid Ed25519 key pair', () => {
    const { publicKey, privateKey } = generateAgentKeyPair();

    expect(publicKey).toContain('BEGIN PUBLIC KEY');
    expect(privateKey).toContain('BEGIN PRIVATE KEY');
  });

  it('should generate unique key pairs', () => {
    const pair1 = generateAgentKeyPair();
    const pair2 = generateAgentKeyPair();

    expect(pair1.publicKey).not.toBe(pair2.publicKey);
    expect(pair1.privateKey).not.toBe(pair2.privateKey);
  });
});
