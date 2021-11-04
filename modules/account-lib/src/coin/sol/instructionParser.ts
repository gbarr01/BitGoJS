import { SystemInstruction, TransactionInstruction } from '@solana/web3.js';

import { TransactionType } from '../baseCoin';
import { NotSupported } from '../baseCoin/errors';
import { InstructionBuilderTypes, ValidInstructionTypesEnum } from './constants';
import { InstructionParams, WalletInit, Transfer, Nonce, Memo } from './iface';
import { getInstructionType } from './utils';

export function instructionParser(type: TransactionType, instructions: TransactionInstruction[]): InstructionParams[] {
  const instructionData: InstructionParams[] = [];
  if (type === TransactionType.WalletInitialization) {
    const walletInit = parseWalletInitTransaction(instructions);
    instructionData.push(walletInit);
  } else if (type === TransactionType.Send) {
    const send = parseSendTransaction(instructions);
    instructionData.push(...send);
  } else {
    throw new NotSupported('Invalid transaction, transaction type not supported: ' + type);
  }

  return instructionData;
}

export function parseWalletInitTransaction(instructions: TransactionInstruction[]): WalletInit {
  const createInstruction = SystemInstruction.decodeCreateAccount(instructions[0]);
  const nonceInitInstruction = SystemInstruction.decodeNonceInitialize(instructions[1]);

  const walletInit: WalletInit = {
    type: InstructionBuilderTypes.CreateNonceAccount,
    params: {
      fromAddress: createInstruction.fromPubkey.toString(),
      nonceAddress: nonceInitInstruction.noncePubkey.toString(),
      authAddress: nonceInitInstruction.authorizedPubkey.toString(),
      amount: createInstruction.lamports.toString(),
    },
  };
  return walletInit;
}

export function parseSendTransaction(instructions: TransactionInstruction[]): Array<Nonce | Memo | Transfer> {
  const instructionData: Array<Nonce | Memo | Transfer> = [];
  for (const instruction of instructions) {
    const type = getInstructionType(instruction);
    switch (type) {
      case ValidInstructionTypesEnum.Memo:
        const memo: Memo = { type: InstructionBuilderTypes.Memo, params: { memo: instruction.data.toString() } };
        instructionData.push(memo);
        break;
      case ValidInstructionTypesEnum.AdvanceNonceAccount:
        const advanceNonceInstruction = SystemInstruction.decodeNonceAdvance(instruction);
        const nonce: Nonce = {
          type: InstructionBuilderTypes.NonceAdvance,
          params: {
            walletNoncePubKey: advanceNonceInstruction.noncePubkey.toString(),
            authWalletPubKey: advanceNonceInstruction.authorizedPubkey.toString(),
          },
        };
        instructionData.push(nonce);
        break;
      case ValidInstructionTypesEnum.Transfer:
        const transferInstruction = SystemInstruction.decodeTransfer(instruction);
        const transfer: Transfer = {
          type: InstructionBuilderTypes.Transfer,
          params: {
            fromAddress: transferInstruction.fromPubkey.toString(),
            toAddress: transferInstruction.toPubkey.toString(),
            amount: transferInstruction.lamports.toString(),
          },
        };
        instructionData.push(transfer);
        break;
      default:
        throw new NotSupported(
          'Invalid transaction, instruction type not supported: ' + getInstructionType(instruction),
        );
    }
  }
  return instructionData;
}
