import { Encrypter } from '@/package/shared/module/cryptography/contracts/encrypter.js';

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload);
  }
}
