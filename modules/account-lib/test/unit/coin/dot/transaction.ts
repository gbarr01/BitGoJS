import should from 'should';
import { coins } from '@bitgo/statics';
import * as DotResources from '../../../resources/dot';
import { KeyPair, Transaction, TransferBuilder } from '../../../../src/coin/dot';

class StubTransferBuilder extends TransferBuilder {
  /**
   * Sets the testnet for test transactions
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://wiki.polkadot.network/docs/build-transaction-construction
   */
  testnet(): this {
    this.specName('polkadot');
    this.genesisHash('0x2b8d4fdbb41f4bc15b8a7ec8ed0687f2a1ae11e0fc2dc6604fa962a9421ae349');
    this.metadataRpc(DotResources.testnetMetadataRpc);
    this.specVersion(9100);
    this.chainName('Polkadot');
    this.buildRegistry();
    return this;
  }
}

describe('Dot Transaction', () => {
  let tx: Transaction;

  beforeEach(() => {
    const config = coins.get('dot');
    tx = new Transaction(config);
  });

  describe('empty transaction', () => {
    it('should throw empty transaction', () => {
      should.throws(() => tx.toJson(), 'Empty transaction');
      should.throws(() => tx.toBroadcastFormat(), 'Empty transaction');
    });

    it('should not sign', async () => {
      try {
        await tx.sign(new KeyPair({ prv: DotResources.accounts.account1.secretKey }));
      } catch (e) {
        should.equal(e.message, 'No transaction data to sign');
      }
    });
  });

  describe('sign transaction', () => {
    it('cannot sign - wrong account secret', () => {
      tx.sender(DotResources.accounts.account1.address);
      should.deepEqual(tx.canSign({ key: DotResources.accounts.account2.secretKey }), false);
    });

    it('can sign', () => {
      tx.sender(DotResources.accounts.account2.address);
      should.deepEqual(tx.canSign({ key: DotResources.accounts.account2.secretKey }), true);
    });
  });

  describe('should build from raw unsigned tx', async () => {
    it('Transaction size validation', async () => {
      const builder = new StubTransferBuilder(coins.get('dot'));
      builder.testnet().from(DotResources.rawTx.transfer.unsigned);
      builder
        .testnet()
        .validity({ firstValid: 3933 })
        .blockHash('0x149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d')
        .sender({ address: DotResources.accounts.account1.address });
      const tx = (await builder.build()) as Transaction;
      should.deepEqual(tx.transactionSize(), DotResources.rawTx.transfer.unsigned.length / 2);
    });
  });
});
