import { BaseTxInfo, TypeRegistry, DecodedUnsignedTx } from '@substrate/txwrapper-core/lib/types';

export interface Seed {
  seed: Uint8Array;
}

/**
 * Specification name type of the chain. Used in setting up the registry
 */
export type specNameType = 'kusama' | 'polkadot' | 'westend' | 'statemint' | 'statemine';

/**
 * Method names for the transaction method. Names change based on the type of transaction e.g 'bond' for the staking transaction
 */
export enum MethodNames {
  AddProxy = 'addProxy',
  Proxy = 'proxy',
  Bond = 'bond',
  TransferKeepAlive = 'transferKeepAlive',
}

/**
 * Block validity interface based on the BitgoJS standard doc.
 */
export interface Validity {
  firstValid: number;
  lastValid?: number;
}

/**
 * The transaction data returned from the toJson() function of a transaction
 */
export interface TxData {
  sender: string;
  blockHash: string;
  blockNumber: number;
  genesisHash: string;
  metadataRpc: string;
  nonce: number;
  specVersion: number;
  transactionVersion: number;
  chainName: string;
  specName?: string;
  amount?: string;
  dest?: string;
  tip?: number;
  eraPeriod?: number;
  controller?: string;
  payee?: string;
  delegate?: string;
  proxyType?: string;
  delay?: string;
  real?: string;
  forceProxyType?: proxyType;
  call?: string;
}

/**
 * Transaction method specific args
 */
export interface TransferArgs {
  dest: { id: string };
  value: string;
}

/**
 * Transaction method specific args
 */
export type StakeArgsPayee =
  | 'Staked'
  | 'Stash'
  | 'Controller'
  | {
      Account: string;
    };

/**
 * Transaction method specific args
 */
export type StakeArgsPayeeRaw = { controller?: null; stash?: null; staked?: null; account?: string };

/**
 * Transaction method specific args
 */
export interface StakeArgs {
  value: string;
  controller: { id: string };
  payee: StakeArgsPayee;
}

/**
 * The types of proxies that can be setup and used
 * https://wiki.polkadot.network/docs/learn-proxies#proxy-types
 */
export type proxyType =
  | 'Any'
  | 'NonTransfer'
  | 'Governance'
  | 'Staking'
  | 'UnusedSudoBalances'
  | 'IdentityJudgement'
  | 'CancelProxy';

/**
 * Transaction method specific args
 */
export interface AddProxyArgs {
  delegate: string;
  delay: string;
  proxyType: proxyType;
}

/**
 * Transaction method specific args
 */
export type ProxyCallArgs =
  | string
  | {
      callIndex?: string;
      args?: TransferArgs | StakeArgs;
    };

/**
 * Transaction method specific args
 */
export interface ProxyArgs {
  real: string;
  forceProxyType: proxyType;
  call: string;
}

/**
 * Decoded TxMethod from a transaction hex
 */
export interface TxMethod {
  args: TransferArgs | StakeArgs | AddProxyArgs | ProxyArgs;
  name: 'transferKeepAlive' | 'bond' | 'addProxy' | 'proxy';
  pallet: string;
}

/**
 * Modified unsigned transaction with a decoded method instead of a method hex
 */
export interface DecodedTx extends Omit<DecodedUnsignedTx, 'method'> {
  method: TxMethod;
}

/**
 * Base transaction info shared across all types of transactions
 */
export interface CreateBaseTxInfo {
  baseTxInfo: BaseTxInfo;
  options: {
    metadataRpc: string;
    registry: TypeRegistry;
  };
}

/**
 * Nonce interface based on BitgoJS standards doc
 */
export interface sequenceId {
  name: string; // "Nonce", "Sequence Id", "Counter"
  keyword: string; // "nonce", "sequenceId", "counter"
  value: string | number;
}
