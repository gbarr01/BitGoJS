import should from 'should';
import { register } from '../../../../../src';
import { TransactionBuilderFactory, KeyPair } from '../../../../../src/coin/sol';
import { TransactionType } from '../../../../../src/coin/baseCoin';
import * as testData from '../../../../resources/sol/sol';

describe('Stx Transfer Builder', async () => {
  let builders;
  const factory = register('tsol', TransactionBuilderFactory);
  const authAccount = new KeyPair(testData.authAccount).getKeys();
  const nonceAccount = new KeyPair(testData.nonceAccount).getKeys();
  const validBlockhash = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi';

  beforeEach(function (done) {
    builders = [factory.getWalletInitializationBuilder(), factory.getTransferBuilder()];
    done();
  });

  it('start and build an empty wallet init tx', async () => {
    const txBuilder = factory.getWalletInitializationBuilder();
    txBuilder.feePayer(authAccount.pub);
    txBuilder.nonce(validBlockhash);
    const tx = await txBuilder.build();
    should.equal(tx.type, TransactionType.WalletInitialization);
  });

  it('start and build an empty a transfer tx', async () => {
    const txBuilder = factory.getTransferBuilder();
    txBuilder.feePayer(authAccount.pub);
    txBuilder.nonce(validBlockhash);
    const tx = await txBuilder.build();
    should.equal(tx.type, TransactionType.Send);
  });

  it('should fail to build if missing feePayer', async () => {
    for (const txBuilder of builders) {
      txBuilder.nonce(validBlockhash);
      await txBuilder.build().should.rejectedWith('Invalid transaction: missing feePayer');
    }
  });

  it('should fail to build if missing nonce', async () => {
    for (const txBuilder of builders) {
      txBuilder.feePayer(authAccount.pub);
      await txBuilder.build().should.rejectedWith('Invalid transaction: missing nonce blockhash');
    }
  });

  it('build a wallet init from rawTx', async () => {
    const txBuilder = factory.from(testData.WALLET_INIT_SIGNED_TX);
    const builtTx = await txBuilder.build();
    should.equal(builtTx.type, TransactionType.WalletInitialization);
    should.equal(
      builtTx.id,
      '2QdKALq4adaTahJH13AGzM5bAFuNshw43iQBdVS9D2Loq736zUgPXfHj32cNJKX6FyjUzYJhGfEyAAB5FgYUW6zR',
    );
    const jsonTx = builtTx.toJson();
    jsonTx.id.should.equal('2QdKALq4adaTahJH13AGzM5bAFuNshw43iQBdVS9D2Loq736zUgPXfHj32cNJKX6FyjUzYJhGfEyAAB5FgYUW6zR');
    jsonTx.feePayer.should.equal('5hr5fisPi6DXNuuRpm5XUbzpiEnmdyxXuBDTwzwZj5Pe');
    jsonTx.nonce.should.equal('GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi');
    jsonTx.feeMultiplier.should.equal(1);
    jsonTx.instructionsData.should.deepEqual([
      {
        type: 'CreateNonceAccount',
        params: {
          fromAddress: '5hr5fisPi6DXNuuRpm5XUbzpiEnmdyxXuBDTwzwZj5Pe',
          nonceAddress: '8Y7RM6JfcX4ASSNBkrkrmSbRu431YVi9Y3oLFnzC2dCh',
          authAddress: '5hr5fisPi6DXNuuRpm5XUbzpiEnmdyxXuBDTwzwZj5Pe',
          amount: '300000',
        },
      },
    ]);
    builtTx.toBroadcastFormat().should.equal(testData.WALLET_INIT_SIGNED_TX);
  });

  it('build a send from rawTx', async () => {
    const txBuilder = factory.from(testData.TRANSFER_SIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE);
    const builtTx = await txBuilder.build();
    should.equal(builtTx.type, TransactionType.Send);
    should.equal(
      builtTx.id,
      '3pD6ayWtvFkn8Fe5efYbSaCYMpnDwzDTmmeoMhcSMAcMrGvmwPFhLxok5vxhHnooA3YSXfnyZgi4e3K3sCHmgU3k',
    );
    const jsonTx = builtTx.toJson();
    jsonTx.id.should.equal('3pD6ayWtvFkn8Fe5efYbSaCYMpnDwzDTmmeoMhcSMAcMrGvmwPFhLxok5vxhHnooA3YSXfnyZgi4e3K3sCHmgU3k');
    jsonTx.feePayer.should.equal('5hr5fisPi6DXNuuRpm5XUbzpiEnmdyxXuBDTwzwZj5Pe');
    jsonTx.nonce.should.equal('GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi');
    jsonTx.feeMultiplier.should.equal(1);
    jsonTx.instructionsData.should.deepEqual([
      {
        type: 'NonceAdvance',
        params: {
          walletNoncePubKey: '8Y7RM6JfcX4ASSNBkrkrmSbRu431YVi9Y3oLFnzC2dCh',
          authWalletPubKey: '5hr5fisPi6DXNuuRpm5XUbzpiEnmdyxXuBDTwzwZj5Pe',
        },
      },
      {
        type: 'Memo',
        params: { memo: 'test memo' },
      },
      {
        type: 'Transfer',
        params: {
          fromAddress: '5hr5fisPi6DXNuuRpm5XUbzpiEnmdyxXuBDTwzwZj5Pe',
          toAddress: 'CP5Dpaa42RtJmMuKqCQsLwma5Yh3knuvKsYDFX85F41S',
          amount: '300000',
        },
      },
    ]);
    builtTx.toBroadcastFormat().should.equal(testData.TRANSFER_SIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE);
  });
  describe('Nonce tests', async () => {
    it('should throw for invalid nonce', () => {
      const blockHash = 'randomstring';
      for (const txBuilder of builders) {
        should(() => txBuilder.nonce(blockHash)).throw('Invalid or missing blockHash, got: ' + blockHash);
      }
    });

    it('should throw for invalid params using durable nonce', () => {
      const invalidPubKey = 'randomstring';
      for (const txBuilder of builders) {
        should(() => txBuilder.nonce(validBlockhash, true, invalidPubKey, authAccount.pub)).throw(
          'Invalid or missing walletNoncePubKey, got: ' + invalidPubKey,
        );

        should(() => txBuilder.nonce(validBlockhash, true, nonceAccount.pub, invalidPubKey)).throw(
          'Invalid or missing authWalletPubKey, got: ' + invalidPubKey,
        );

        should(() => txBuilder.nonce(validBlockhash, true, nonceAccount.pub, nonceAccount.pub)).throw(
          'Invalid params: walletNoncePubKey cannot be equal to authWalletPubKey',
        );
      }
    });

    it('should succeed for valid nonce', () => {
      for (const txBuilder of builders) {
        should.doesNotThrow(() => txBuilder.nonce(validBlockhash));
      }
    });

    it('should succeed for valid durable nonce', () => {
      for (const txBuilder of builders) {
        should.doesNotThrow(() => txBuilder.nonce(validBlockhash, true, nonceAccount.pub, authAccount.pub));
      }
    });
  });

  describe('Fee Payer tests', async () => {
    it('should throw for invalid feePayer', () => {
      const invalidPublicKey = 'randomstring';
      for (const txBuilder of builders) {
        should(() => txBuilder.feePayer(invalidPublicKey)).throw(
          'Invalid or missing feePayerAddress, got: ' + invalidPublicKey,
        );
      }
    });
    it('should succeed for valid feePayer', () => {
      for (const txBuilder of builders) {
        should.doesNotThrow(() => txBuilder.feePayer(authAccount.pub));
      }
    });
  });
});
