import should from 'should';
import * as testData from '../../../resources/sol/sol';
import { instructionParser } from '../../../../src/coin/sol/instructionParser';
import { TransactionType } from '../../../../src/coin/baseCoin';
import { InstructionParams } from '../../../../src/coin/sol/iface';
import { InstructionBuilderTypes, MEMO_PROGRAM_PK } from '../../../../src/coin/sol/constants';
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

describe('Instruction Parser Tests: ', function () {
  describe('Succeed ', function () {
    it('Wallet init tx instructions', () => {
      const fromAddress = testData.authAccount.pub;
      const nonceAddress = testData.nonceAccount.pub;
      const authAddress = testData.authAccount.pub;
      const amount = '100000';
      const instructions = SystemProgram.createNonceAccount({
        fromPubkey: new PublicKey(fromAddress),
        noncePubkey: new PublicKey(nonceAddress),
        authorizedPubkey: new PublicKey(authAddress),
        lamports: new BigNumber(amount).toNumber(),
      }).instructions;

      const createNonceAccount: InstructionParams = {
        type: InstructionBuilderTypes.CreateNonceAccount,
        params: { fromAddress, nonceAddress, authAddress, amount },
      };

      const result = instructionParser(TransactionType.WalletInitialization, instructions);
      should.deepEqual(result, [createNonceAccount]);
    });

    it('Send tx instructions', () => {
      const authAccount = testData.authAccount.pub;
      const nonceAccount = testData.nonceAccount.pub;
      const amount = '100000';
      const memo = 'test memo';

      // nonce
      const nonceAdvanceParams: InstructionParams = {
        type: InstructionBuilderTypes.NonceAdvance,
        params: { walletNoncePubKey: nonceAccount, authWalletPubKey: authAccount },
      };
      const nonceAdvanceInstruction = SystemProgram.nonceAdvance({
        noncePubkey: new PublicKey(nonceAccount),
        authorizedPubkey: new PublicKey(authAccount),
      });

      // transfer
      const transferParams: InstructionParams = {
        type: InstructionBuilderTypes.Transfer,
        params: { fromAddress: authAccount, toAddress: nonceAccount, amount },
      };
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(authAccount),
        toPubkey: new PublicKey(nonceAccount),
        lamports: new BigNumber(amount).toNumber(),
      });

      // memo
      const memoParams: InstructionParams = {
        type: InstructionBuilderTypes.Memo,
        params: { memo },
      };

      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: new PublicKey(MEMO_PROGRAM_PK),
        data: Buffer.from(memo),
      });

      const instructions = [nonceAdvanceInstruction, transferInstruction, memoInstruction];
      const instructionsData = [nonceAdvanceParams, transferParams, memoParams];
      const result = instructionParser(TransactionType.Send, instructions);
      should.deepEqual(result, instructionsData);
    });
  });
  describe('Fail ', function () {
    it('Invalid type', () => {
      should(() => instructionParser(TransactionType.ContractCall, [])).throwError(
        'Invalid transaction, transaction type not supported: ' + TransactionType.ContractCall,
      );
    });
  });
});
