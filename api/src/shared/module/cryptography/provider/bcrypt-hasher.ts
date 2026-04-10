import { Injectable } from '@nestjs/common'

import { hash, compare } from 'bcryptjs'

import { HashComparer } from '../interface/hash-comparer'
import { HashGenerator } from '../interface/hash-generator'

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}