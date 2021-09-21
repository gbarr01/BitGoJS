import * as bitcoinjs from 'bitcoinjs-lib';

import * as zcashAddress from '../src/bitgo/zcash/address';

import { Network } from './networkTypes';
import { isValidNetwork, isZcash } from './coins';
import { Base58CheckResult } from 'bitcoinjs-lib/types/address';

export function fromOutputScript(outputScript: Buffer, network: Network) {
  if (isValidNetwork(network) && isZcash(network)) {
    return zcashAddress.fromOutputScript(outputScript, network);
  }
  return bitcoinjs.address.fromOutputScript(outputScript, network as bitcoinjs.Network);
}

export function toOutputScript(address: string, network: Network) {
  if (isValidNetwork(network) && isZcash(network)) {
    return zcashAddress.toOutputScript(address, network);
  }
  return bitcoinjs.address.toOutputScript(address, network as bitcoinjs.Network);
}

export function toBase58Check(hash: Buffer, version: number, network: Network): string {
  if (isValidNetwork(network) && isZcash(network)) {
    return zcashAddress.toBase58Check(hash, version);
  }
  return bitcoinjs.address.toBase58Check(hash, version);
}

export function fromBase58Check(address: string, network: Network): Base58CheckResult {
  if (isValidNetwork(network) && isZcash(network)) {
    return zcashAddress.fromBase58Check(address);
  }
  return bitcoinjs.address.fromBase58Check(address);
}

export const { fromBech32, toBech32 } = bitcoinjs.address;
