import { Keypair } from '@solana/web3.js';
import { BaseKeyPair } from '../baseCoin';
import { InvalidKey } from '../baseCoin/errors';
import { DefaultKeys, isPrivateKey, isPublicKey, isSeed, KeyPairOptions } from '../baseCoin/iface';
import { SolanaKeys } from './iface';
import { base58ToUint8Array, isValidPrivateKey, isValidPublicKey, Uint8ArrayTobase58 } from './utils';

export class KeyPair implements BaseKeyPair {
  protected keyPair: DefaultKeys;
  protected source?: KeyPairOptions;
  /**
   * Public constructor. By default, creates a key pair with a random master seed.
   *
   * @param { KeyPairOptions } source Either a master seed, a private key, or a public key
   */
  constructor(source?: KeyPairOptions) {
    let kp: Keypair;
    if (!source) {
      kp = Keypair.generate();
      this.setKP(kp);
    } else if (isSeed(source)) {
      kp = Keypair.fromSeed(source.seed.slice(0, 32));
      this.setKP(kp);
    } else if (isPrivateKey(source)) {
      this.recordKeysFromPrivateKey(source.prv);
    } else if (isPublicKey(source)) {
      this.recordKeysFromPublicKey(source.pub);
    } else {
      throw new Error('Invalid key pair options');
    }
  }

  private setKP(keyPair: Keypair): void {
    this.keyPair = {
      prv: Uint8ArrayTobase58(keyPair.secretKey),
      pub: keyPair.publicKey.toString(),
    };
  }

  /** @inheritdoc */
  recordKeysFromPrivateKey(prv: string): void {
    if (isValidPrivateKey(prv)) {
      const prvKey = base58ToUint8Array(prv);
      const keyPair = Keypair.fromSecretKey(prvKey);
      this.setKP(keyPair);
    } else {
      throw new InvalidKey('Invalid private key');
    }
  }

  /** @inheritdoc */
  recordKeysFromPublicKey(pub: string): void {
    if (isValidPublicKey(pub)) {
      this.keyPair = { pub };
    } else {
      throw new InvalidKey('Invalid public key: ' + pub);
    }
  }

  /**
   * Solana default keys format public key as a base58 string and secret key as Uint8Array
   *
   * @param {boolean} raw defines if the prv key is returned in Uint8Array, default is base58
   * @returns {SolanaKeys} The keys in the defined format
   */
  getKeys(raw = false): SolanaKeys {
    const result: SolanaKeys = { pub: this.keyPair.pub };
    if (!!this.keyPair.prv) {
      if (raw) {
        result.prv = base58ToUint8Array(this.keyPair.prv);
      } else {
        result.prv = this.keyPair.prv;
      }
    }
    return result;
  }

  /** @inheritdoc */
  getAddress(): string {
    const keys = this.getKeys();
    return keys.pub;
  }
}
