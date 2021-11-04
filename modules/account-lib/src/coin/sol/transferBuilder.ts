import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { BuildTransactionError } from '../baseCoin/errors';
import { TransactionBuilder } from './transactionBuilder';
import { Transaction } from './transaction';
import { isValidAmount, isValidPublicKey } from './utils';
import { TransactionType } from '../baseCoin';
import { InstructionBuilderTypes } from './constants';
import { Memo, Transfer } from './iface';

export class TransferBuilder extends TransactionBuilder {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  protected get transactionType(): TransactionType {
    return TransactionType.Send;
  }

  /**
   *  Set the memo
   *
   * @param {string} memo
   * @returns {TransactionBuilder} This transaction builder
   */
  memo(memo: string): this {
    this.validateMemo(memo);
    const memoData: Memo = {
      type: InstructionBuilderTypes.Memo,
      params: { memo },
    };
    this._instructionsData.push(memoData);
    return this;
  }

  transfer(fromAddress: string, toAddress: string, amount: string): this {
    if (!fromAddress || !isValidPublicKey(fromAddress)) {
      throw new BuildTransactionError('Invalid or missing fromAddress, got: ' + fromAddress);
    }
    if (!toAddress || !isValidPublicKey(toAddress)) {
      throw new BuildTransactionError('Invalid or missing toAddress, got: ' + toAddress);
    }
    if (!amount || !isValidAmount(amount)) {
      throw new BuildTransactionError('Invalid or missing amount, got: ' + amount);
    }

    const transferData: Transfer = {
      type: InstructionBuilderTypes.Transfer,
      params: { fromAddress, toAddress, amount },
    };
    this._instructionsData.push(transferData);
    return this;
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this.transaction.setTransactionType(TransactionType.Send);
    return await super.buildImplementation();
  }
}
