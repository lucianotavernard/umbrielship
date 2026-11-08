import { Hasher } from '@/package/shared/module/cryptography/contracts/hasher.js';

export class FakeHasher implements Hasher {
  async hash(plain: string): Promise<string> {
    return `${plain}-hashed`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return `${plain}-hashed` === hash;
  }
}
