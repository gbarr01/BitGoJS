import { ValidInstructionTypes } from './iface';

export const MEMO_PROGRAM_PK = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

export enum ValidInstructionTypesEnum {
  AdvanceNonceAccount = 'AdvanceNonceAccount',
  Create = 'Create',
  InitializeNonceAccount = 'InitializeNonceAccount',
  Transfer = 'Transfer',
  Memo = 'Memo',
}

export enum InstructionBuilderTypes {
  CreateNonceAccount = 'CreateNonceAccount',
  Transfer = 'Transfer',
  Memo = 'Memo',
  NonceAdvance = 'NonceAdvance',
}

export const VALID_SYSTEM_INSTRUCTION_TYPES: ValidInstructionTypes[] = [
  ValidInstructionTypesEnum.AdvanceNonceAccount,
  ValidInstructionTypesEnum.Create,
  ValidInstructionTypesEnum.Transfer,
  ValidInstructionTypesEnum.InitializeNonceAccount,
  ValidInstructionTypesEnum.Memo,
];
