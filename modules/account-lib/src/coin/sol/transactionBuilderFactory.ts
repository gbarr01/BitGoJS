import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { BaseTransactionBuilderFactory, TransactionType } from '../baseCoin';
import { InvalidTransactionError, ParseTransactionError } from '../baseCoin/errors';
import { TransferBuilder } from './transferBuilder';
import { WalletInitializationBuilder } from './walletInitializationBuilder';
import { TransactionBuilder } from './transactionBuilder';
import { Transaction } from './transaction';
import { isValidRawTransaction } from './utils';

export class TransactionBuilderFactory extends BaseTransactionBuilderFactory {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  /**
   * Returns a proper builder for the given encoded transaction
   *
   * @param { string} raw - Encoded transaction in base64 string format
   */
  from(raw: string): TransactionBuilder {
    this.validateRawTransaction(raw);
    const tx = this.parseTransaction(raw);
    try {
      switch (tx.type) {
        case TransactionType.Send:
          return this.getTransferBuilder(tx);
        case TransactionType.WalletInitialization:
          return this.getWalletInitializationBuilder(tx);

        default:
          throw new InvalidTransactionError('Invalid transaction');
      }
    } catch (e) {
      throw e;
    }
  }

  /** @inheritdoc */
  getWalletInitializationBuilder(tx?: Transaction): WalletInitializationBuilder {
    return this.initializeBuilder(tx, new WalletInitializationBuilder(this._coinConfig));
  }

  /** @inheritdoc */
  getTransferBuilder(tx?: Transaction): TransferBuilder {
    return this.initializeBuilder(tx, new TransferBuilder(this._coinConfig));
  }

  /**
   * Initialize the builder with the given transaction
   *
   * @param {Transaction | undefined} tx - the transaction used to initialize the builder
   * @param {TransactionBuilder} builder - the builder to be initialized
   * @returns {TransactionBuilder} the builder initialized
   */
  private initializeBuilder<T extends TransactionBuilder>(tx: Transaction | undefined, builder: T): T {
    if (tx) {
      builder.initBuilder(tx);
    }
    return builder;
  }

  private parseTransaction(rawTransaction: string): Transaction {
    const tx = new Transaction(this._coinConfig);
    tx.fromRawTransaction(rawTransaction);
    return tx;
  }

  /**
   * Check the raw transaction has a valid format in the blockchain context, throw otherwise.
   *
   * @param {string} rawTransaction - Transaction in base64 string  format
   */
  private validateRawTransaction(rawTransaction: string) {
    if (!rawTransaction) {
      throw new ParseTransactionError('Invalid raw transaction: Undefined');
    }
    if (!isValidRawTransaction(rawTransaction)) {
      throw new ParseTransactionError('Invalid raw transaction');
    }
  }
}
