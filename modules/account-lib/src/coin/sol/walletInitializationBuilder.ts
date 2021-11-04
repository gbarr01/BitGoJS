import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { BuildTransactionError } from '../baseCoin/errors';
import { Transaction } from './transaction';
import { TransactionBuilder } from './transactionBuilder';
import { isValidAmount, isValidPublicKey } from './utils';
import { TransactionType } from '../baseCoin';
import { WalletInit } from './iface';
import { InstructionBuilderTypes } from './constants';

export class WalletInitializationBuilder extends TransactionBuilder {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }
  protected get transactionType(): TransactionType {
    return TransactionType.WalletInitialization;
  }

  walletInit(fromAddress: string, nonceAddress: string, authAddress: string, amount: string): this {
    if (!fromAddress || !isValidPublicKey(fromAddress)) {
      throw new BuildTransactionError('Invalid or missing fromAddress, got: ' + fromAddress);
    }
    if (!nonceAddress || !isValidPublicKey(nonceAddress)) {
      throw new BuildTransactionError('Invalid or missing toAddress, got: ' + nonceAddress);
    }
    if (fromAddress === nonceAddress) {
      throw new BuildTransactionError('nonceAddress cant be equal to fromAddress');
    }
    if (!authAddress || !isValidPublicKey(authAddress)) {
      throw new BuildTransactionError('Invalid or missing authAddress, got: ' + authAddress);
    }
    if (fromAddress !== authAddress) {
      throw new BuildTransactionError('authAddress has to be equal to fromAddress');
    }
    if (!amount || !isValidAmount(amount)) {
      throw new BuildTransactionError('Invalid or missing amount, got: ' + amount);
    }

    const walletInitData: WalletInit = {
      type: InstructionBuilderTypes.CreateNonceAccount,
      params: {
        fromAddress,
        nonceAddress,
        authAddress,
        amount,
      },
    };
    this._instructionsData.push(walletInitData);
    return this;
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this.transaction.setTransactionType(TransactionType.WalletInitialization);
    return await super.buildImplementation();
  }
}
