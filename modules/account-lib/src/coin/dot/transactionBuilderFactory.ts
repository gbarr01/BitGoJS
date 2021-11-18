import { BaseCoin as CoinConfig, DotNetwork, PolkadotSpecNameType } from '@bitgo/statics';
import { BaseTransactionBuilderFactory } from '../baseCoin';
import { BuildTransactionError, NotSupported } from '../baseCoin/errors';
import { decode, getRegistry } from '@substrate/txwrapper-polkadot';
import { TypeRegistry } from '@substrate/txwrapper-core/lib/types';
import { TransactionBuilder } from './transactionBuilder';
import { TransferBuilder } from './transferBuilder';
import { WalletInitializationBuilder } from './walletInitializationBuilder';
import { StakingBuilder } from './stakingBuilder';
import { mainnetMetadataRpc, westendMetadataRpc } from '../../../resources/dot';
import { MethodNames } from './iface';
import { UnstakeBuilder } from '.';

export class TransactionBuilderFactory extends BaseTransactionBuilderFactory {
  protected _specVersion: number;
  protected _specName: PolkadotSpecNameType;
  protected _chainName: string;
  protected _metadataRpc: string;
  protected _registry: TypeRegistry;
  protected _genesisHash: string;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.staticsConfig();
  }

  getTransferBuilder(): TransferBuilder {
    return new TransferBuilder(this._coinConfig);
  }

  getStakingBuilder(): StakingBuilder {
    return new StakingBuilder(this._coinConfig);
  }

  getWalletInitializationBuilder(): WalletInitializationBuilder {
    return new WalletInitializationBuilder(this._coinConfig);
  }

  getUnstakeBuilder(): UnstakeBuilder {
    return new UnstakeBuilder(this._coinConfig);
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
   * @param {PolkadotSpecNameType} specName
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  specName(specName: PolkadotSpecNameType): this {
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

  private staticsConfig(): void {
    const networkConfig = this._coinConfig.network as DotNetwork;
    this.specName(networkConfig.specName);
    this.genesisHash(networkConfig.genesisHash);
    this.specVersion(networkConfig.specVersion);
    this.chainName(networkConfig.chainName);
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
    this.metadataRpc(westendMetadataRpc);
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
    this.metadataRpc(mainnetMetadataRpc);
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
    const methodName = decodedTxn.method?.name;
    if (methodName === MethodNames.TransferKeepAlive || methodName === MethodNames.Proxy) {
      return this.getTransferBuilder();
    } else if (methodName === MethodNames.Bond) {
      return this.getStakingBuilder();
    } else if (methodName === MethodNames.AddProxy) {
      return this.getWalletInitializationBuilder();
    } else if (methodName === MethodNames.Unbond) {
      return this.getUnstakeBuilder();
    } else {
      throw new NotSupported('Transaction cannot be parsed or has an unsupported transaction type');
    }
  }
}
