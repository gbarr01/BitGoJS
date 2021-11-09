import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { BaseTransactionBuilderFactory } from '../baseCoin';
import { BuildTransactionError, NotSupported } from '../baseCoin/errors';
import { decode, getRegistry } from '@substrate/txwrapper-polkadot';
import { TypeRegistry } from '@substrate/txwrapper-core/lib/types';
import { TransactionBuilder } from './transactionBuilder';
import { TransferBuilder } from './transferBuilder';
import { ProxyBuilder } from './proxyBuilder';
import { AddProxyBuilder } from './addProxyBuilder';
import { StakeBuilder } from './stakeBuilder';
import { mainnetMetadataRpc, testnetMetadataRpc, westendMetadataRpc } from './metadataRpc';
import { MethodNames, specNameType } from './iface';

export class TransactionBuilderFactory extends BaseTransactionBuilderFactory {
  protected _specVersion: number;
  protected _specName: specNameType;
  protected _chainName: string;
  protected _metadataRpc: string;
  protected _registry: TypeRegistry;
  protected _genesisHash: string;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  getTransferBuilder(): TransferBuilder {
    return new TransferBuilder(this._coinConfig);
  }

  getProxyBuilder(): ProxyBuilder {
    return new ProxyBuilder(this._coinConfig);
  }

  getStakeBuilder(): StakeBuilder {
    return new StakeBuilder(this._coinConfig);
  }

  getAddProxyBuilder(): AddProxyBuilder {
    return new AddProxyBuilder(this._coinConfig);
  }

  from(rawTxn: string): TransactionBuilder {
    const builder = this.getBuilder(rawTxn);
    builder.specName(this._specName);
    builder.metadataRpc(this._metadataRpc);
    builder.chainName(this._chainName);
    builder.specVersion(this._specVersion);
    builder.genesisHash(this._genesisHash);
    builder.buildRegistry();
    builder.from(rawTxn);
    return builder;
  }

  buildRegistry(): this {
    this._registry = getRegistry({
      chainName: this._chainName,
      specName: this._specName,
      specVersion: this._specVersion,
      metadataRpc: this._metadataRpc,
    });
    return this;
  }

  /**
   *
   * The genesis hash of the chain.
   *
   * @param {string} genesisHash
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  genesisHash(genesisHash: string): this {
    this._genesisHash = genesisHash;
    return this;
  }

  /**
   *
   * The spec name for the registry.
   *
   * @param {specNameType} specName
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  specName(specName: specNameType): this {
    this._specName = specName;
    return this;
  }

  /**
   *
   * The raw metadata of the chain in string format.
   *
   * @param {string} metadataRpc
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  metadataRpc(metadataRpc: string): this {
    this._metadataRpc = metadataRpc;
    return this;
  }

  /**
   *
   * The specVersion for transaction format.
   *
   * @param {number} specVersion
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  specVersion(specVersion: number): this {
    this._specVersion = specVersion;
    return this;
  }

  /**
   *
   * The chainName for transaction format.
   *
   * @param {number} chainName
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  chainName(chainName: string): this {
    this._chainName = chainName;
    return this;
  }

  /**
   * Sets the
   * specName,
   * genesisHash - genesisHash of the chain,
   * metadataRpc - The SCALE-encoded metadata for the runtime when submitted,
   * specVersion - The current spec version for the runtime,
   * chainName - chainName,
   * registry,
   * of the testnet
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  testnet(): this {
    this.specName('polkadot');
    this.metadataRpc(testnetMetadataRpc);
    this.specVersion(9100);
    this.chainName('Polkadot');
    this.genesisHash('0x2b8d4fdbb41f4bc15b8a7ec8ed0687f2a1ae11e0fc2dc6604fa962a9421ae349');
    this.buildRegistry();
    return this;
  }

  /**
   * Sets the
   * specName,
   * genesisHash - genesisHash of the chain,
   * metadataRpc - The SCALE-encoded metadata for the runtime when submitted,
   * specVersion - The current spec version for the runtime,
   * chainName - chainName,
   * registry,
   * of the westened
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  westend(): this {
    this.specName('westend');
    this.metadataRpc(westendMetadataRpc);
    this.specVersion(9122);
    this.chainName('Westend');
    this.genesisHash('0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e');
    this.buildRegistry();
    return this;
  }

  /**
   * Sets the
   * specName,
   * genesisHash - genesisHash of the chain,
   * metadataRpc - The SCALE-encoded metadata for the runtime when submitted,
   * specVersion - The current spec version for the runtime,
   * chainName - chainName,
   * registry,
   * of the mainnet
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  mainnet(): this {
    this.specName('polkadot');
    this.metadataRpc(mainnetMetadataRpc);
    this.specVersion(9122);
    this.chainName('Polkadot');
    this.genesisHash('0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3');
    this.buildRegistry();
    return this;
  }

  private getBuilder(rawTxn: string): TransactionBuilder {
    if (!this._registry || !this._metadataRpc) {
      throw new BuildTransactionError('Please set the network before parsing the transaction');
    }
    const decodedTxn = decode(rawTxn, {
      metadataRpc: this._metadataRpc,
      registry: this._registry,
    });
    if (decodedTxn.method?.name === MethodNames.TransferKeepAlive) {
      return this.getTransferBuilder();
    } else if (decodedTxn.method?.name === MethodNames.Bond) {
      return this.getStakeBuilder();
    } else if (decodedTxn.method?.name === MethodNames.AddProxy) {
      return this.getAddProxyBuilder();
    } else if (decodedTxn.method?.name === MethodNames.Proxy) {
      return this.getProxyBuilder();
    } else {
      throw new NotSupported('Transaction cannot be parsed or has an unsupported transaction type');
    }
  }

  public getWalletInitializationBuilder(): TransferBuilder {
    return new TransferBuilder(this._coinConfig);
  }
}
