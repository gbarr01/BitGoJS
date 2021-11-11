import { BaseTxInfo, TypeRegistry, DecodedUnsignedTx } from '@substrate/txwrapper-core/lib/types';

export interface Seed {
  seed: Uint8Array;
}
export type specNameType = 'kusama' | 'polkadot' | 'westend' | 'statemint' | 'statemine';

export enum MethodNames {
  AddProxy = 'addProxy',
  Proxy = 'proxy',
  Bond = 'bond',
  TransferKeepAlive = 'transferKeepAlive',
}

export interface Validity {
  firstValid: number;
  lastValid?: number;
}

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

export interface TransferArgs {
  dest: { id: string };
  value: string;
}

export type StakeArgsPayee =
  | 'Staked'
  | 'Stash'
  | 'Controller'
  | {
      Account: string;
    };

export type StakeArgsPayeeRaw = { controller?: null; stash?: null; staked?: null; account?: string };

export interface StakeArgs {
  value: string;
  controller: { id: string };
  payee: StakeArgsPayee;
}

export type proxyType =
  | 'Any'
  | 'NonTransfer'
  | 'Governance'
  | 'Staking'
  | 'UnusedSudoBalances'
  | 'IdentityJudgement'
  | 'CancelProxy';

export interface AddProxyArgs {
  delegate: string;
  delay: string;
  proxyType: proxyType;
}

export type ProxyCallArgs =
  | string
  | {
      callIndex?: string;
      args?: TransferArgs | StakeArgs;
    };
export interface ProxyArgs {
  real: string;
  forceProxyType: proxyType;
  call: string;
}
export interface TxMethod {
  args: TransferArgs | StakeArgs | AddProxyArgs | ProxyArgs;
  name: 'transferKeepAlive' | 'bond' | 'addProxy' | 'proxy';
  pallet: string;
}

export interface DecodedTx extends Omit<DecodedUnsignedTx, 'method'> {
  method: TxMethod;
}

export interface CreateBaseTxInfo {
  baseTxInfo: BaseTxInfo;
  options: {
    metadataRpc: string;
    registry: TypeRegistry;
  };
}

export interface sequenceId {
  name: string; // "Nonce", "Sequence Id", "Counter"
  keyword: string; // "nonce", "sequenceId", "counter"
  value: string | number;
}
