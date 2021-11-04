import { register } from '../../../../../src';
import { TransactionBuilderFactory, KeyPair, Utils } from '../../../../../src/coin/sol';
import should from 'should';
import * as testData from '../../../../resources/sol/sol';

describe('Stx Wallet Initialization Builder', () => {
  const factory = register('tsol', TransactionBuilderFactory);

  const walletInitBuilder = () => {
    const txBuilder = factory.getWalletInitializationBuilder();
    txBuilder.nonce(recentBlockHash);
    txBuilder.feePayer(authAccount.pub);
    return txBuilder;
  };

  const authAccount = new KeyPair(testData.authAccount).getKeys();
  const nonceAccount = new KeyPair(testData.nonceAccount).getKeys();
  const wrongAccount = new KeyPair({ prv: testData.prvKeys.prvKey1.base58 }).getKeys();
  const recentBlockHash = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi';
  const amount = '300000';

  describe('Build and sign', () => {
    describe('Succeed', () => {
      it('build a wallet init tx unsigned', async () => {
        const txBuilder = walletInitBuilder();
        txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
        const tx = await txBuilder.build();
        const rawTx = tx.toBroadcastFormat();
        should.equal(Utils.isValidRawTransaction(rawTx), true);
        should.equal(rawTx, testData.WALLET_INIT_UNSIGNED_TX);
      });

      it('build a wallet init tx unsigned with amount 0', async () => {
        const txBuilder = walletInitBuilder();
        txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, '0');
        const tx = await txBuilder.build();
        const rawTx = tx.toBroadcastFormat();
        should.equal(Utils.isValidRawTransaction(rawTx), true);
        should.equal(rawTx, testData.WALLET_INIT_UNSIGNED_TX_AMOUNT_ZERO);
      });

      it('build a wallet init tx and sign it', async () => {
        const txBuilder = walletInitBuilder();
        txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
        txBuilder.sign({ key: authAccount.prv });
        const tx = await txBuilder.build();
        const rawTx = tx.toBroadcastFormat();
        should.equal(Utils.isValidRawTransaction(rawTx), true);
        should.equal(rawTx, testData.WALLET_INIT_SIGNED_TX);
      });

      it('build a wallet init tx with zero amount and sign it', async () => {
        const txBuilder = walletInitBuilder();
        txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, '0');
        txBuilder.sign({ key: authAccount.prv });
        const tx = await txBuilder.build();
        const rawTx = tx.toBroadcastFormat();
        should.equal(Utils.isValidRawTransaction(rawTx), true);
        should.equal(rawTx, testData.WALLET_INIT_SIGNED_TX_AMOUNT_ZERO);
      });
    });
    describe('Fail', () => {
      it('build a wallet init tx when the nonceAddress is equal to the fromAddress', () => {
        const txBuilder = walletInitBuilder();
        should(() => txBuilder.walletInit(authAccount.pub, authAccount.pub, authAccount.pub, amount)).throwError(
          'nonceAddress cant be equal to fromAddress',
        );
      });

      it('build a wallet init tx when authAddress is not equal to the fromAddress', () => {
        const txBuilder = walletInitBuilder();
        should(() => txBuilder.walletInit(authAccount.pub, nonceAccount.pub, wrongAccount.pub, amount)).throwError(
          'authAddress has to be equal to fromAddress',
        );
      });

      it('build a wallet init tx when amount is invalid', () => {
        const txBuilder = walletInitBuilder();
        should(() =>
          txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, 'randomstring'),
        ).throwError('Invalid or missing amount, got: randomstring');
      });

      it('build a wallet init tx and sign with an incorrect account', async () => {
        const txBuilder = walletInitBuilder();
        txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
        txBuilder.sign({ key: wrongAccount.prv });
        await txBuilder.build().should.rejectedWith('unknown signer: CP5Dpaa42RtJmMuKqCQsLwma5Yh3knuvKsYDFX85F41S');
      });

      it('build when nonce is not provided', async () => {
        const txBuilder = factory.getWalletInitializationBuilder();
        txBuilder.feePayer(authAccount.pub);
        txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
        txBuilder.sign({ key: authAccount.prv });
        await txBuilder.build().should.rejectedWith('Invalid transaction: missing nonce blockhash');
      });

      it('build when feePayer is not provided', async () => {
        const txBuilder = factory.getWalletInitializationBuilder();
        txBuilder.nonce(recentBlockHash);
        txBuilder.walletInit(authAccount.pub, nonceAccount.pub, authAccount.pub, amount);
        txBuilder.sign({ key: authAccount.prv });
        await txBuilder.build().should.rejectedWith('Invalid transaction: missing feePayer');
      });
    });
  });
  describe('From and sign', () => {
    describe('Succeed', () => {
      it('build from a unsigned wallet init and sign it', async () => {
        const txBuilder = factory.from(testData.WALLET_INIT_UNSIGNED_TX);
        txBuilder.sign({ key: authAccount.prv });
        const tx = await txBuilder.build();
        const rawTx = tx.toBroadcastFormat();
        should.equal(Utils.isValidRawTransaction(rawTx), true);
        should.equal(rawTx, testData.WALLET_INIT_SIGNED_TX);
      });
    });
    describe('Fail', () => {
      it('build from a unsigned wallet init and fail to sign it', async () => {
        const txBuilder = factory.from(testData.WALLET_INIT_UNSIGNED_TX);
        txBuilder.sign({ key: wrongAccount.prv });
        await txBuilder.build().should.rejectedWith('unknown signer: CP5Dpaa42RtJmMuKqCQsLwma5Yh3knuvKsYDFX85F41S');
      });
      it('build from a signed wallet init and fail to sign it', async () => {
        const txBuilder = factory.from(testData.WALLET_INIT_SIGNED_TX);
        txBuilder.sign({ key: wrongAccount.prv });
        await txBuilder.build().should.rejectedWith('unknown signer: CP5Dpaa42RtJmMuKqCQsLwma5Yh3knuvKsYDFX85F41S');
      });
    });
  });
});
