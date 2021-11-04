import should from 'should';
import * as testData from '../../../resources/sol/sol';
import { instructionBuilder } from '../../../../src/coin/sol/instructionBuilders';
import { InstructionBuilderTypes, MEMO_PROGRAM_PK } from '../../../../src/coin/sol/constants';
import { InstructionParams } from '../../../../src/coin/sol/iface';
import { TransactionInstruction, PublicKey, SystemProgram } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

describe('Instruction Builder Tests: ', function () {
  describe('Succeed ', function () {
    it('Memo', () => {
      const memo = 'test memo';
      const memoParams: InstructionParams = {
        type: InstructionBuilderTypes.Memo,
        params: { memo },
      };

      const result = instructionBuilder(memoParams);
      should.deepEqual(result, [
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey(MEMO_PROGRAM_PK),
          data: Buffer.from(memo),
        }),
      ]);
    });

    it('Transfer', () => {
      const fromAddress = testData.authAccount.pub;
      const toAddress = testData.nonceAccount.pub;
      const amount = '100000';
      const transferParams: InstructionParams = {
        type: InstructionBuilderTypes.Transfer,
        params: { fromAddress, toAddress, amount },
      };

      const result = instructionBuilder(transferParams);
      should.deepEqual(result, [
        SystemProgram.transfer({
          fromPubkey: new PublicKey(fromAddress),
          toPubkey: new PublicKey(toAddress),
          lamports: new BigNumber(amount).toNumber(),
        }),
      ]);
    });

    it('Advance nonce', () => {
      const authWalletPubKey = testData.authAccount.pub;
      const walletNoncePubKey = testData.nonceAccount.pub;
      const nonceAdvanceParams: InstructionParams = {
        type: InstructionBuilderTypes.NonceAdvance,
        params: { walletNoncePubKey, authWalletPubKey },
      };

      const result = instructionBuilder(nonceAdvanceParams);
      should.deepEqual(result, [
        SystemProgram.nonceAdvance({
          noncePubkey: new PublicKey(walletNoncePubKey),
          authorizedPubkey: new PublicKey(authWalletPubKey),
        }),
      ]);
    });

    it('Create and Nonce initialize', () => {
      const fromAddress = testData.authAccount.pub;
      const nonceAddress = testData.nonceAccount.pub;
      const authAddress = testData.authAccount.pub;
      const amount = '100000';
      const createNonceAccountParams: InstructionParams = {
        type: InstructionBuilderTypes.CreateNonceAccount,
        params: { fromAddress, nonceAddress, authAddress, amount },
      };

      const result = instructionBuilder(createNonceAccountParams);
      should.deepEqual(
        result,
        SystemProgram.createNonceAccount({
          fromPubkey: new PublicKey(fromAddress),
          noncePubkey: new PublicKey(nonceAddress),
          authorizedPubkey: new PublicKey(authAddress),
          lamports: new BigNumber(amount).toNumber(),
        }).instructions,
      );
    });
  });

  describe('Fail ', function () {
    it('Invalid type', () => {
      // @ts-expect-error Testing for an invalid type, should throw error
      should(() => instructionBuilder({ type: 'random', params: {} })).throwError(
        'Invalid instruction type or not supported',
      );
    });
  });
});
