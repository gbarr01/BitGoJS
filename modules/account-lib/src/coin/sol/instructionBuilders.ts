import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import assert from 'assert';
import BigNumber from 'bignumber.js';
import { InstructionBuilderTypes, MEMO_PROGRAM_PK } from './constants';
import { InstructionParams, Memo, Nonce, Transfer, WalletInit } from './iface';

export function instructionBuilder(instructionToBuild: InstructionParams): TransactionInstruction[] {
  switch (instructionToBuild.type) {
    case InstructionBuilderTypes.NonceAdvance:
      return advanceNonceBuilder(instructionToBuild);
    case InstructionBuilderTypes.Memo:
      return memoBuilder(instructionToBuild);
    case InstructionBuilderTypes.Transfer:
      return transferBuilder(instructionToBuild);
    case InstructionBuilderTypes.CreateNonceAccount:
      return createNonceAccountBuilder(instructionToBuild);
    default:
      throw new Error(`Invalid instruction type or not supported`);
  }
}

function advanceNonceBuilder(data: Nonce) {
  const {
    params: { authWalletPubKey, walletNoncePubKey },
  } = data;
  assert(authWalletPubKey, 'Missing authWalletPubKey param');
  assert(walletNoncePubKey, 'Missing authWalletPubKey param');
  const nonceInstruction = SystemProgram.nonceAdvance({
    noncePubkey: new PublicKey(walletNoncePubKey),
    authorizedPubkey: new PublicKey(authWalletPubKey),
  });
  return [nonceInstruction];
}

function memoBuilder(data: Memo) {
  const {
    params: { memo },
  } = data;
  assert(memo, 'Missing memo param');
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: new PublicKey(MEMO_PROGRAM_PK),
    data: Buffer.from(memo),
  });
  return [memoInstruction];
}

function transferBuilder(data: Transfer) {
  const {
    params: { fromAddress, toAddress, amount },
  } = data;
  assert(fromAddress, 'Missing fromAddress param');
  assert(toAddress, 'Missing toAddress param');
  assert(amount, 'Missing toAddress param');
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: new PublicKey(fromAddress),
    toPubkey: new PublicKey(toAddress),
    lamports: new BigNumber(amount).toNumber(),
  });
  return [transferInstruction];
}

function createNonceAccountBuilder(data: WalletInit) {
  const {
    params: { fromAddress, nonceAddress, authAddress, amount },
  } = data;
  assert(fromAddress, 'Missing fromAddress param');
  assert(nonceAddress, 'Missing nonceAddress param');
  assert(authAddress, 'Missing authAddress param');
  assert(amount, 'Missing amount param');
  const nonceAccountInstruction = SystemProgram.createNonceAccount({
    fromPubkey: new PublicKey(fromAddress),
    noncePubkey: new PublicKey(nonceAddress),
    authorizedPubkey: new PublicKey(authAddress),
    lamports: new BigNumber(amount).toNumber(),
  });
  return nonceAccountInstruction.instructions;
}
