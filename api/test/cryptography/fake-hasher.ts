import { HashComparer } from '@/shared/module/cryptography/interface/hash-comparer';
import { HashGenerator } from '@/shared/module/cryptography/interface/hash-generator';

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return `${plain}-hashed`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return `${plain}-hashed` === hash;
  }
}
