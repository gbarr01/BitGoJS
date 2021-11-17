import * as bip32 from 'bip32';
import * as assert from 'assert';
import { TxOutput } from 'bitcoinjs-lib';

import * as networks from '../src/networks';
import { Network } from '../src/networkTypes';
import { UtxoTransaction } from '../src/bitgo/UtxoTransaction';
import {
  createTransactionBuilderForNetwork,
  createTransactionBuilderFromTransaction,
  createTransactionFromBuffer,
  signInput2Of3,
  signInputP2shP2pk,
  UtxoTransactionBuilder,
} from '../src/bitgo';
import {
  createScriptPubKey,
  getDefaultCosigner,
  KeyTriple,
  TxOutPoint,
} from './integration_local_rpc/generate/outputScripts.util';
import { fixtureKeys } from './integration_local_rpc/generate/fixtures';
import { createOutputScript2of3, isScriptType2Of3, ScriptType2Of3 } from '../src/bitgo/outputScripts';
import { isTriple } from '../src/bitgo/types';

export function getSignKeyCombinations(length: number): bip32.BIP32Interface[][] {
  if (length === 0) {
    return [];
  }
  if (length === 1) {
    return fixtureKeys.map((k) => [k]);
  }
  return getSignKeyCombinations(length - 1)
    .map((head) => fixtureKeys.filter((k) => !head.includes(k)).map((k) => [...head, k]))
    .reduce((all, keys) => [...all, ...keys]);
}

export function parseTransactionRoundTrip<T extends UtxoTransaction>(
  buf: Buffer,
  network: Network,
  inputs?: (TxOutPoint & TxOutput)[]
): T {
  const tx = createTransactionFromBuffer(buf, network);
  assert.strictEqual(tx.byteLength(), buf.length);
  assert.strictEqual(tx.toBuffer().toString('hex'), buf.toString('hex'));

  // Test `Transaction.clone()` implementation
  assert.strictEqual(tx.clone().toBuffer().toString('hex'), buf.toString('hex'));

  // Test `TransactionBuilder.fromTransaction()` implementation
  if (inputs) {
    inputs.forEach(({ txid, index, value }, i) => {
      (tx.ins[i] as any).value = value;
    });
    assert.strictEqual(
      createTransactionBuilderFromTransaction(tx, inputs).build().toBuffer().toString('hex'),
      buf.toString('hex')
    );
  }

  return tx as T;
}

export const defaultTestOutputAmount = 1e8;

export function getPrevOutputs(
  value = defaultTestOutputAmount,
  scriptType: ScriptType2Of3 | 'p2shP2pk'
): (TxOutPoint & TxOutput)[] {
  return [
    {
      txid: Buffer.alloc(32).fill(0xff).toString('hex'),
      index: 0,
      script: isScriptType2Of3(scriptType)
        ? createOutputScript2of3(
            fixtureKeys.map((k) => k.publicKey),
            scriptType
          ).scriptPubKey
        : Buffer.from([]),
      value,
    },
  ];
}

export function getTransactionBuilder(
  keys: KeyTriple,
  signKeys: bip32.BIP32Interface[],
  scriptType: ScriptType2Of3 | 'p2shP2pk',
  network: Network,
  {
    outputAmount = defaultTestOutputAmount,
    prevOutputs = getPrevOutputs(outputAmount, scriptType),
  }: {
    outputAmount?: number;
    prevOutputs?: (TxOutPoint & TxOutput)[];
  } = {}
): UtxoTransactionBuilder {
  const txBuilder = createTransactionBuilderForNetwork(network);

  prevOutputs.forEach(({ txid, index }) => {
    txBuilder.addInput(txid, index);
  });

  const recipientScript = createScriptPubKey(fixtureKeys, 'p2pkh', networks.bitcoin);
  txBuilder.addOutput(recipientScript, outputAmount - 1000);

  const pubkeys = keys.map((k) => k.publicKey);
  assert(isTriple(pubkeys));

  prevOutputs.forEach(({ value }, vin) => {
    signKeys.forEach((key) => {
      if (scriptType === 'p2shP2pk') {
        signInputP2shP2pk(txBuilder, vin, key);
      } else {
        signInput2Of3(
          txBuilder,
          vin,
          scriptType as ScriptType2Of3,
          pubkeys,
          key,
          getDefaultCosigner(pubkeys, key.publicKey),
          value
        );
      }
    });
  });

  return txBuilder;
}
