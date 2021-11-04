import should from 'should';
import { coins } from '@bitgo/statics';
import { Transaction } from '../../../../src/coin/sol/transaction';
import * as testData from '../../../resources/sol/sol';
import { KeyPair } from '../../../../src/coin/sol';

describe('Sol Transaction', () => {
  const coin = coins.get('tsol');

  it('should throw empty transaction', () => {
    const tx = new Transaction(coin);
    should.throws(() => tx.toJson(), 'Empty transaction');
    should.throws(() => tx.toBroadcastFormat(), 'Empty transaction');
  });

  describe('sign should', () => {
    it('fail if the tx doesnt have nonce', async () => {
      const tx = new Transaction(coin);
      const kp = new KeyPair({ prv: testData.prvKeys.prvKey1.base58 });
      await tx.sign(kp).should.be.rejectedWith('Nonce is required before signing');
    });

    it('fail if the KeyPair is not the right one', async () => {
      const tx = new Transaction(coin);
      tx.fromRawTransaction(testData.RAW_TX_UNSIGNED);
      const keypair = new KeyPair({ prv: testData.prvKeys.prvKey1.base58 });
      await tx.sign(keypair).should.be.rejectedWith('unknown signer: CP5Dpaa42RtJmMuKqCQsLwma5Yh3knuvKsYDFX85F41S');
    });

    it('fail if the KeyPair doesnt have a prv key', async () => {
      const tx = new Transaction(coin);
      tx.fromRawTransaction(testData.RAW_TX_UNSIGNED);
      const keypair = new KeyPair({ pub: testData.pubKeys.validPubKeys[0] });
      await tx.sign(keypair).should.be.rejectedWith('Missing private key');
    });

    it('succeed to sign with 1 KeyPair', async () => {
      const tx = new Transaction(coin);
      tx.fromRawTransaction(testData.RAW_TX_UNSIGNED);
      const keypair = new KeyPair({ prv: testData.accountWithSeed.privateKey.base58 });
      await tx.sign(keypair).should.be.fulfilled();
      should.equal(tx.toBroadcastFormat(), testData.RAW_TX_SIGNED);
    });

    it('succeed when try to sign with the same keyPair multiple times ', async () => {
      const tx = new Transaction(coin);
      tx.fromRawTransaction(testData.RAW_TX_UNSIGNED);
      const keypair = new KeyPair({ prv: testData.accountWithSeed.privateKey.base58 });
      await tx.sign([keypair, keypair, keypair, keypair]).should.be.fulfilled();
      should.equal(tx.toBroadcastFormat(), testData.RAW_TX_SIGNED);
    });

    it('succeed when try to sign with a keyPair that already signed', async () => {
      const tx = new Transaction(coin);
      tx.fromRawTransaction(testData.RAW_TX_SIGNED);
      const keypair = new KeyPair({ prv: testData.accountWithSeed.privateKey.base58 });
      await tx.sign(keypair).should.be.fulfilled();
      should.equal(tx.toBroadcastFormat(), testData.RAW_TX_SIGNED);
    });
  });

  describe('transaction parsing', function () {
    it('fromRawTransaction and toBroadcastFormat', async function () {
      const tx = new Transaction(coin);
      tx.fromRawTransaction(testData.RAW_TX_UNSIGNED);
      should.equal(tx.toBroadcastFormat(), testData.RAW_TX_UNSIGNED);
    });

    it('fromRawTransaction, sign and toBroadcastFormat ', async function () {
      const tx = new Transaction(coin);
      tx.fromRawTransaction(testData.RAW_TX_UNSIGNED);
      const keypair = new KeyPair({ prv: testData.accountWithSeed.privateKey.base58 });
      await tx.sign(keypair);
      should.equal(tx.toBroadcastFormat(), testData.RAW_TX_SIGNED);
    });
  });
});
