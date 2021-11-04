import { register } from '../../../../../src';
import { TransactionBuilderFactory, KeyPair, Utils } from '../../../../../src/coin/sol';
import should from 'should';
import * as testData from '../../../../resources/sol/sol';

describe('Stx Transfer Builder', () => {
  const factory = register('tsol', TransactionBuilderFactory);

  const authAccount = new KeyPair(testData.authAccount).getKeys();
  const nonceAccount = new KeyPair(testData.nonceAccount).getKeys();
  const otherAccount = new KeyPair({ prv: testData.prvKeys.prvKey1.base58 }).getKeys();
  const recentBlockHash = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi';
  const amount = '300000';
  const memo = 'test memo';

  describe('Succeed', () => {
    it('build a transfer tx unsigned with memo', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.memo(memo);
      txBuilder.transfer(authAccount.pub, otherAccount.pub, amount);
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.TRANSFER_UNSIGNED_TX_WITH_MEMO);
    });

    it('build a transfer tx unsigned with durable nonce', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash, true, nonceAccount.pub, authAccount.pub);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.transfer(authAccount.pub, otherAccount.pub, amount);
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.TRANSFER_UNSIGNED_TX_WITH_DURABLE_NONCE);
    });

    it('build a transfer tx unsigned with memo and durable nonce', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash, true, nonceAccount.pub, authAccount.pub);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.memo(memo);
      txBuilder.transfer(authAccount.pub, otherAccount.pub, amount);
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.TRANSFER_UNSIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE);
    });

    it('build a transfer tx unsigned without memo or durable nonce', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.transfer(authAccount.pub, otherAccount.pub, amount);
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.TRANSFER_UNSIGNED_TX_WITHOUT_MEMO);
    });

    it('build a transfer tx signed with memo and durable nonce', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash, true, nonceAccount.pub, authAccount.pub);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.memo(memo);
      txBuilder.transfer(authAccount.pub, otherAccount.pub, amount);
      txBuilder.sign({ key: authAccount.prv });
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.TRANSFER_SIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE);
    });
    /* it('should succeed to build a wallet init tx unsigned with amount 0', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, '0');
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.WALLET_INIT_UNSIGNED_TX_AMOUNT_ZERO);
    });

    it('should succeed to build a wallet init tx and sign it', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
      txBuilder.sign({ key: authAccount.prv });
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.WALLET_INIT_SIGNED_TX);
    });

    it('should succeed to build a wallet init tx with zero amount and sign it', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, '0');
      txBuilder.sign({ key: authAccount.prv });
      const tx = await txBuilder.build();
      const rawTx = tx.toBroadcastFormat();
      should.equal(Utils.isValidRawTransaction(rawTx), true);
      should.equal(rawTx, testData.WALLET_INIT_SIGNED_TX_AMOUNT_ZERO);
    });*/
  });
  /* describe('Fail', () => {
    it('should fail to build a wallet init tx when the nonceAddress is equal to the fromAddress', () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      should(() => txBuilder.walletInit(authAccount.pub, authAccount.pub, authAccount.pub, amount)).throwError(
        'nonceAddress cant be equal to fromAddress',
      );
    });

    it('should fail to build a wallet init tx when authAddress is not equal to the fromAddress', () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      should(() => txBuilder.walletInit(authAccount.pub, nonceAccount.pub, wrongAccount.pub, amount)).throwError(
        'authAddress has to be equal to fromAddress',
      );
    });

    it('should fail to build a wallet init tx when amount is invalid', () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      should(() => txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, 'randomstring')).throwError(
        'Invalid or missing amount, got: randomstring',
      );
    });

    it('should fail to build a wallet init tx and sign with an incorrect account', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.feePayer(authAccount.pub);
      txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
      txBuilder.sign({ key: wrongAccount.prv });
      await txBuilder.build().should.rejectedWith('unknown signer: CP5Dpaa42RtJmMuKqCQsLwma5Yh3knuvKsYDFX85F41S');
    });

    it('should fail to build when nonce is not provided', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.feePayer(authAccount.pub);
      txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
      txBuilder.sign({ key: authAccount.prv });
      await txBuilder.build().should.rejectedWith('nonce is required before building');
    });

    it('should fail to build when feePayer is not provided', async () => {
      const txBuilder = factory.getTransferBuilder();
      txBuilder.nonce(recentBlockHash);
      txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
      txBuilder.sign({ key: authAccount.prv });
      await txBuilder.build().should.rejectedWith('feePayer is required before building');
    });
  });*/
});
