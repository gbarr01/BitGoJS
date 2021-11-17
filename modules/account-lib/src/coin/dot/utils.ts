import { decodeAddress, encodeAddress, Keyring } from '@polkadot/keyring';
import { decodePair } from '@polkadot/keyring/pair/decode';
import { KeyringPair } from '@polkadot/keyring/types';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { hexToU8a, isHex } from '@polkadot/util';
import { base64Decode } from '@polkadot/util-crypto';

import { UnsignedTransaction } from '@substrate/txwrapper-core';
import { TypeRegistry } from '@substrate/txwrapper-core/lib/types';
import { construct, createMetadata } from '@substrate/txwrapper-polkadot';
import base32 from 'hi-base32';
import { KeyPair } from '.';
import { BaseUtils } from '../baseCoin';
import { NotImplementedError } from '../baseCoin/errors';
import { DefaultKeys, Seed } from '../baseCoin/iface';
import { ProxyCallArgs, TransferArgs } from './iface';
const polkaUtils = require('@polkadot/util');
const { createTypeUnsafe } = require('@polkadot/types');

export class Utils implements BaseUtils {
  /** @inheritdoc */
  isValidAddress(address: string): boolean {
    try {
      encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
      return true;
    } catch (error) {
      return false;
    }
  }

  /** @inheritdoc */
  isValidBlockId(hash: string): boolean {
    throw new NotImplementedError('method not implemented');
  }

  /** @inheritdoc */
  isValidPrivateKey(key: string): boolean {
    throw new NotImplementedError('method not implemented');
  }

  /** @inheritdoc */
  isValidPublicKey(key: string): boolean {
    throw new NotImplementedError('method not implemented');
  }

  /** @inheritdoc */
  isValidSignature(signature: string): boolean {
    throw new NotImplementedError('method not implemented');
  }

  /** @inheritdoc */
  isValidTransactionId(txId: string): boolean {
    throw new NotImplementedError('method not implemented');
  }

  /**
   * decodeSeed decodes a dot seed
   *
   * @param {string} seed - the seed to be validated.
   * @returns {Seed} - the object Seed
   */
  decodeSeed(seed: string): Seed {
    const decoded = base32.decode.asBytes(seed);
    return {
      seed: Buffer.from(decoded),
    };
  }

  capitalizeFirstLetter(val: string): string {
    return val.charAt(0).toUpperCase() + val.slice(1);
  }

  decodeCallMethod(
    tx: string | UnsignedTransaction,
    options: { metadataRpc: string; registry: TypeRegistry },
  ): TransferArgs {
    const { metadataRpc, registry } = options;
    registry.setMetadata(createMetadata(registry, metadataRpc));
    let methodCall: any;
    if (typeof tx === 'string') {
      try {
        const payload = createTypeUnsafe(registry, 'ExtrinsicPayload', [tx, { version: EXTRINSIC_VERSION }]);
        methodCall = createTypeUnsafe(registry, 'Call', [payload.method]);
      } catch (e) {
        methodCall = registry.createType('Extrinsic', polkaUtils.hexToU8a(tx), {
          isSigned: true,
        }).method;
      }
    } else {
      methodCall = registry.createType('Call', tx.method);
    }
    const decodedArgs = methodCall.args[2].toJSON() as unknown as ProxyCallArgs;
    return decodedArgs.args;
  }

  /**
   * keyPairFromSeed generates an object with secretKey and publicKey using the polkadot sdk
   * @param seed 32 bytes long seed
   * @returns KeyPair
   */
  keyPairFromSeed(seed: Uint8Array): KeyPair {
    const keyring = new Keyring({ type: 'ed25519' });
    const keyringPair = keyring.addFromSeed(seed);
    const pairJson = keyringPair.toJson();
    const decodedKeyPair = decodePair('', base64Decode(pairJson.encoded), pairJson.encoding.type);
    return new KeyPair({ prv: Buffer.from(decodedKeyPair.secretKey).toString('hex') });
  }

  /**
   * Signing function. Implement this on the OFFLINE signing device.
   *
   * @param {KeyringPair} pair - The signing pair.
   * @param {string} signingPayload - Payload to sign.
   */
  createSignedTx(pair: KeyringPair, signingPayload: string, transaction: UnsignedTransaction, options): string {
    const { registry, metadataRpc } = options;
    // Important! The registry needs to be updated with latest metadata, so make
    // sure to run `registry.setMetadata(metadata)` before signing.
    registry.setMetadata(createMetadata(registry, metadataRpc));
    const { signature } = registry
      .createType('ExtrinsicPayload', signingPayload, {
        version: EXTRINSIC_VERSION,
      })
      .sign(pair);

    // Serialize a signed transaction.
    const txHex = construct.signedTx(transaction, signature, {
      metadataRpc,
      registry,
    });
    return txHex;
  }

  /**
   * Returns the decoded keypair from a Dot keyring pair
   *
   * @param {KeyringPair} keyringPair
   * @returns {DefaultKeys} default key format
   */
  decodeDotKeyringPair(keyringPair: KeyringPair): DefaultKeys {
    if (keyringPair.isLocked) {
      return {
        pub: Buffer.from(keyringPair.publicKey).toString('hex'),
      };
    }
    const keyPair = decodePair('', base64Decode(keyringPair.toJson().encoded), keyringPair.toJson().encoding.type);
    return {
      prv: Buffer.from(keyPair.secretKey).toString('hex').slice(0, 64),
      pub: Buffer.from(keyPair.publicKey).toString('hex'),
    };
  }
}

const utils = new Utils();

export default utils;
