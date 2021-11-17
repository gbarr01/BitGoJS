import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { BaseTransaction, TransactionType } from '../baseCoin';
import { BaseKey } from '../baseCoin/iface';
import { InvalidTransactionError, SigningError } from '../baseCoin/errors';
import { construct, decode } from '@substrate/txwrapper-polkadot';
import { UnsignedTransaction } from '@substrate/txwrapper-core';
import { TypeRegistry } from '@substrate/txwrapper-core/lib/types';
import { decodeAddress } from '@polkadot/keyring';
import { KeyPair } from './keyPair';
import { TxData, DecodedTx, StakeArgs, StakeArgsPayeeRaw, AddProxyArgs, UnstakeArgs } from './iface';
import utils from './utils';

export class Transaction extends BaseTransaction {
  protected _dotTransaction: UnsignedTransaction;
  private _signedTransaction?: string;
  private _registry: TypeRegistry;
  private _chainName: string;
  private _sender: string;

  constructor(coinConfig: Readonly<CoinConfig>) {
    super(coinConfig);
  }

  /** @inheritdoc */
  canSign({ key }: BaseKey): boolean {
    const kp = new KeyPair({ prv: key });
    const addr = kp.getAddress();
    if (addr === this._sender) {
      return true;
    }
    return false;
  }

  /** @inheritdoc */
  async sign(keyPair: KeyPair): Promise<void> {
    if (!this._dotTransaction) {
      throw new InvalidTransactionError('No transaction data to sign');
    }
    if (!keyPair.getKeys().prv) {
      throw new SigningError('Missing private key');
    }
    const signingPayload = construct.signingPayload(this._dotTransaction, {
      registry: this._registry,
    });
    // Sign a payload. This operation should be performed on an offline device.
    const signingKeyPair = keyPair.getSigningKeyPair();
    const txHex = utils.createSignedTx(signingKeyPair, signingPayload, this._dotTransaction, {
      metadataRpc: this._dotTransaction.metadataRpc,
      registry: this._registry,
    });

    this._signedTransaction = txHex;
  }

  registry(registry: TypeRegistry): void {
    this._registry = registry;
  }

  chainName(chainName: string): void {
    this._chainName = chainName;
  }

  sender(sender: string): void {
    this._sender = sender;
  }

  /**
   * Returns the hex representation of the method called by the transaction
   * Used to supply the original method to the proxy builder
   *
   * @returns {string} string
   */
  methodHex(): string {
    if (!this._dotTransaction) {
      throw new InvalidTransactionError('Empty Transaction');
    }
    return this._dotTransaction.method;
  }

  /** @inheritdoc */
  toBroadcastFormat(): string {
    if (!this._dotTransaction) {
      throw new InvalidTransactionError('Empty transaction');
    }
    if (this._signedTransaction && this._signedTransaction.length > 0) {
      return this._signedTransaction;
    } else {
      return construct.signingPayload(this._dotTransaction, {
        registry: this._registry,
      });
    }
  }

  transactionSize(): number {
    return this.toBroadcastFormat().length / 2;
  }

  /** @inheritdoc */
  toJson(): TxData {
    if (!this._dotTransaction) {
      throw new InvalidTransactionError('Empty transaction');
    }
    const decodedTx = decode(this._dotTransaction, {
      metadataRpc: this._dotTransaction.metadataRpc,
      registry: this._registry,
    }) as unknown as DecodedTx;

    const result: TxData = {
      sender: decodedTx.address,
      blockHash: decodedTx.blockHash,
      blockNumber: decodedTx.blockNumber,
      genesisHash: decodedTx.genesisHash,
      metadataRpc: decodedTx.metadataRpc,
      nonce: decodedTx.nonce,
      specVersion: decodedTx.specVersion,
      transactionVersion: decodedTx.transactionVersion,
      eraPeriod: decodedTx.eraPeriod,
      chainName: this._chainName,
      tip: decodedTx.tip,
    };

    if (this.type === TransactionType.Send) {
      const txMethod = decodedTx.method.args as any;
      if (txMethod.real) {
        const keypairReal = new KeyPair({
          pub: Buffer.from(decodeAddress(txMethod.real)).toString('hex'),
        });
        result.real = keypairReal.getAddress();
        result.forceProxyType = txMethod.forceProxyType;
        const decodedCall = utils.decodeCallMethod(this._dotTransaction, {
          metadataRpc: this._dotTransaction.metadataRpc,
          registry: this._registry,
        });
        const keypairDest = new KeyPair({
          pub: Buffer.from(decodeAddress(decodedCall.dest.id)).toString('hex'),
        });
        result.to = keypairDest.getAddress();
        result.amount = decodedCall.value;
      } else {
        const keypairDest = new KeyPair({
          pub: Buffer.from(decodeAddress(txMethod.dest.id)).toString('hex'),
        });
        result.to = keypairDest.getAddress();
        result.amount = txMethod.value;
      }
    }

    if (this.type === TransactionType.StakingActivate) {
      const txMethod = decodedTx.method.args as StakeArgs;
      const keypair = new KeyPair({
        pub: Buffer.from(decodeAddress(txMethod.controller.id, false, this._registry.chainSS58)).toString('hex'),
      });

      result.controller = keypair.getAddress();
      result.amount = txMethod.value;

      const payee = txMethod.payee as StakeArgsPayeeRaw;
      if (payee.account) {
        const keypair = new KeyPair({
          pub: Buffer.from(decodeAddress(payee.account, false, this._registry.chainSS58)).toString('hex'),
        });
        result.payee = keypair.getAddress();
      } else {
        const payeeType = utils.capitalizeFirstLetter(Object.keys(payee)[0]) as string;
        result.payee = payeeType;
      }
    }

    if (this.type === TransactionType.WalletInitialization) {
      const txMethod = decodedTx.method.args as AddProxyArgs;
      const keypair = new KeyPair({
        pub: Buffer.from(decodeAddress(txMethod.delegate, false, this._registry.chainSS58)).toString('hex'),
      });
      result.owner = keypair.getAddress();
      result.proxyType = txMethod.proxyType;
      result.delay = txMethod.delay;
    }

    if (this.type === TransactionType.StakingUnlock) {
      const txMethod = decodedTx.method.args as UnstakeArgs;
      result.amount = txMethod.value;
    }

    return result;
  }

  setDotTransaction(tx: UnsignedTransaction): void {
    this._dotTransaction = tx;
  }

  getDotTransaction(): UnsignedTransaction | undefined {
    return this._dotTransaction;
  }

  setTransactionType(transactionType: TransactionType): void {
    this._type = transactionType;
  }

  getTransactionType(): TransactionType | undefined {
    return this._type;
  }
}
