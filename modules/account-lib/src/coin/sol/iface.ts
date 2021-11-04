import { Blockhash, SystemInstructionType, TransactionSignature } from '@solana/web3.js';
import { InstructionBuilderTypes } from './constants';

export interface SolanaKeys {
  prv?: Uint8Array | string;
  pub: string;
}

export interface TxData {
  id?: TransactionSignature;
  feePayer?: string;
  feeMultiplier: number;
  nonce: Blockhash;
  instructionsData?: InstructionParams[];
}

export type InstructionParams = Nonce | Memo | WalletInit | Transfer;

export interface Memo {
  type: InstructionBuilderTypes.Memo;
  params: { memo: string };
}

export interface Nonce {
  type: InstructionBuilderTypes.NonceAdvance;
  params: { walletNoncePubKey: string; authWalletPubKey: string };
}

export interface WalletInit {
  type: InstructionBuilderTypes.CreateNonceAccount;
  params: { fromAddress: string; nonceAddress: string; authAddress: string; amount: string };
}

export interface Transfer {
  type: InstructionBuilderTypes.Transfer;
  params: { fromAddress: string; toAddress: string; amount: string };
}

export type ValidInstructionTypes = SystemInstructionType | 'Memo';
