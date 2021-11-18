import BigNumber from 'bignumber.js';
import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { BaseTransactionBuilder, TransactionType } from '../baseCoin';
import { BuildTransactionError, InvalidTransactionError, SigningError } from '../baseCoin/errors';
import { BaseAddress, BaseKey } from '../baseCoin/iface';
import { Transaction } from './transaction';
import { Transaction as SolTransaction, Blockhash, PublicKey } from '@solana/web3.js';
import { isValidAddress, isValidBlockId, isValidMemo, isValidPublicKey, isValidRawTransaction } from './utils';
import { KeyPair } from '.';
import { InstructionBuilderTypes } from './constants';
import { instructionBuilder } from './instructionBuilders';
import assert from 'assert';
import { InstructionParams, Nonce } from './iface';
import { instructionParser } from './instructionParser';
import base58 from 'bs58';

export abstract class TransactionBuilder extends BaseTransactionBuilder {
  private _transaction: Transaction;
  protected _feePayer: string;
  protected _recentBlockhash: Blockhash;
  protected _nonceInfo: Nonce;
  protected _instructionsData: InstructionParams[] = [];
  protected _signers: KeyPair[] = [];

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.transaction = new Transaction(_coinConfig);
  }

  /**
   * The transaction type.
   */
  protected abstract get transactionType(): TransactionType;

  /**
   * Initialize the transaction builder fields using the decoded transaction data
   *
   * @param {Transaction} tx the transaction data
   */
  initBuilder(tx: Transaction): void {
    this._transaction = tx;
    const txData = tx.toJson();
    this.feePayer(txData.feePayer);
    this.nonce(txData.nonce);
    this._instructionsData = instructionParser(tx.type, tx.solTransaction.instructions);
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    const tx = new Transaction(this._coinConfig);
    this.validateRawTransaction(rawTransaction);
    tx.fromRawTransaction(rawTransaction);
    this.initBuilder(tx);
    return this.transaction;
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this.transaction.solTransaction = this.buildSolTransaction();
    this.transaction.setTransactionType(this.transactionType);
    if (this.transaction.solTransaction.signature) {
      this.transaction.id = base58.encode(this.transaction.solTransaction.signature);
    }

    return this.transaction;
  }

  /**
   * Builds the solana transaction.
   */
  protected buildSolTransaction(): SolTransaction {
    const tx = new SolTransaction();
    if (this._transaction?.solTransaction?.signatures) {
      tx.signatures = this._transaction?.solTransaction?.signatures;
    }
    assert(this._feePayer, new BuildTransactionError('feePayer is required before building'));
    tx.feePayer = new PublicKey(this._feePayer);

    if (this._nonceInfo) {
      tx.nonceInfo = {
        nonce: this._recentBlockhash,
        nonceInstruction: instructionBuilder(this._nonceInfo)[0],
      };
    } else if (this._recentBlockhash) {
      tx.recentBlockhash = this._recentBlockhash;
    } else {
      throw new BuildTransactionError('nonce is required before building');
    }
    for (const instruction of this._instructionsData) {
      tx.add(...instructionBuilder(instruction));
    }
    for (const signer of this._signers) {
      const publicKey = new PublicKey(signer.getKeys().pub);
      const secretKey = signer.getKeys(true).prv;
      assert(secretKey instanceof Uint8Array);
      tx.sign({ publicKey, secretKey });
    }
    return tx;
  }

  // region Getters and Setters
  /** @inheritdoc */
  protected get transaction(): Transaction {
    return this._transaction;
  }

  /** @inheritdoc */
  protected set transaction(transaction: Transaction) {
    this._transaction = transaction;
  }

  /** @inheritdoc */
  protected signImplementation(key: BaseKey): Transaction {
    this.validateKey(key);
    this.checkDuplicatedSigner(key);
    const prv = key.key;
    const signer = new KeyPair({ prv: prv });
    this._signers.push(signer);

    return this._transaction;
  }

  /**
   * Set the transaction fee payer
   *
   * @param {string} feePayerAddress the fee payer account
   * @returns {TransactionBuilder} This transaction builder
   */
  feePayer(feePayerAddress: string | undefined): this {
    if (!feePayerAddress || !isValidPublicKey(feePayerAddress)) {
      throw new BuildTransactionError('Invalid or missing feePayerAddress, got: ' + feePayerAddress);
    }
    this._feePayer = feePayerAddress;
    return this;
  }

  /**
   * Set the transaction nonce
   * Requires both optional params in order to use the durable nonce
   *
   * @param {Blockhash} blockHash The latest blockHash
   * @param {boolean} useDurableNonce Set to true to use Durable Nonce, default is false
   * @param {string} [walletNoncePubKey] the pub key of the nonce Wallet (required for durable nonce)
   * @param {string} [authWalletPubKey] the pub key of the owner of the nonce Wallet (required for durable nonce)
   * @returns {TransactionBuilder} This transaction builder
   */
  nonce(blockHash: Blockhash, useDurableNonce = false, walletNoncePubKey?: string, authWalletPubKey?: string): this {
    if (!blockHash || !isValidBlockId(blockHash)) {
      throw new BuildTransactionError('Invalid or missing blockHash, got: ' + blockHash);
    }
    if (useDurableNonce) {
      if (!walletNoncePubKey || !isValidPublicKey(walletNoncePubKey)) {
        throw new BuildTransactionError('Invalid or missing walletNoncePubKey, got: ' + walletNoncePubKey);
      }
      if (!authWalletPubKey || !isValidPublicKey(authWalletPubKey)) {
        throw new BuildTransactionError('Invalid or missing authWalletPubKey, got: ' + authWalletPubKey);
      }
      if (walletNoncePubKey === authWalletPubKey) {
        throw new BuildTransactionError('Invalid params: walletNoncePubKey cannot be equal to authWalletPubKey');
      }
      this._nonceInfo = {
        type: InstructionBuilderTypes.NonceAdvance,
        params: { walletNoncePubKey, authWalletPubKey },
      };
    }
    this._recentBlockhash = blockHash;
    return this;
  }

  // endregion

  // region Validators
  /** @inheritdoc */
  validateAddress(address: BaseAddress, addressFormat?: string): void {
    if (!isValidAddress(address.address)) {
      throw new BuildTransactionError('Invalid address ' + address.address);
    }
  }

  /** @inheritdoc */
  validateKey(key: BaseKey): void {
    const keyPair = new KeyPair({ prv: key.key });
    if (!keyPair.getKeys().prv) {
      throw new BuildTransactionError('Invalid key');
    }
  }

  /** @inheritdoc */
  validateRawTransaction(rawTransaction: string): void {
    if (!rawTransaction) {
      throw new InvalidTransactionError('Raw transaction is empty');
    }
    if (!isValidRawTransaction(rawTransaction)) {
      throw new InvalidTransactionError('Invalid raw transaction');
    }
  }

  /** @inheritdoc */
  validateTransaction(transaction?: Transaction): void {
    this.validateFeePayer();
    this.validateNonce();
  }

  validateValue(value: BigNumber): void {
    if (value.isLessThan(0)) {
      throw new BuildTransactionError('Value cannot be less than zero');
    }
  }

  validateMemo(memo: string): void {
    if (!memo) {
      throw new BuildTransactionError('Invalid memo, got: ' + memo);
    }
    if (!isValidMemo(memo)) {
      throw new BuildTransactionError('Memo is too long');
    }
  }

  /**
   * Validates that the given key is not already in this._signers
   *
   * @param {BaseKey} key - The key to check
   */
  private checkDuplicatedSigner(key: BaseKey) {
    this._signers.forEach((kp) => {
      if (kp.getKeys().prv === key.key) {
        throw new SigningError('Repeated sign: ' + key.key);
      }
    });
  }

  /**
   * Validates that the feePayer field is defined
   */
  private validateFeePayer(): void {
    if (this._feePayer === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing feePayer');
    }
  }

  /**
   * Validates that the feePayer field is defined
   */
  private validateNonce(): void {
    if (this._recentBlockhash === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing nonce blockhash');
    }
  }
  // endregion
}
