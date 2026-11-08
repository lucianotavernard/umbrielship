import { Module } from '@nestjs/common';

import { BcryptHasher } from '@/package/shared/module/cryptography/bcrypt-hasher.js';
import { Encrypter } from '@/package/shared/module/cryptography/contracts/encrypter.js';
import { Hasher } from '@/package/shared/module/cryptography/contracts/hasher.js';
import { JwtEncrypter } from '@/package/shared/module/cryptography/jwt-encrypter.js';

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: Hasher, useClass: BcryptHasher },
  ],
  exports: [Encrypter, Hasher],
})
export class CryptographyModule {}
