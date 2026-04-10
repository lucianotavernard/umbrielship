import { Module } from '@nestjs/common'

import { Encrypter } from './interface/encrypter';
import { HashComparer } from './interface/hash-comparer'
import { HashGenerator } from './interface/hash-generator'

import { JwtEncrypter } from './provider/jwt-encrypter'
import { BcryptHasher } from './provider/bcrypt-hasher'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}