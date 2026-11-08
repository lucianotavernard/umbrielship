import { Module } from '@nestjs/common';

import { BcryptHasher } from '@/package/shared/module/cryptography/bcrypt-hasher';
import { Encrypter } from '@/package/shared/module/cryptography/contracts/encrypter';
import { Hasher } from '@/package/shared/module/cryptography/contracts/hasher';
import { JwtEncrypter } from '@/package/shared/module/cryptography/jwt-encrypter';

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: Hasher, useClass: BcryptHasher },
  ],
  exports: [Encrypter, Hasher],
})
export class CryptographyModule {}
