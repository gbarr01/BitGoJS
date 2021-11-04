import should from 'should';
import { Utils } from '../../../../src/coin/sol';
import * as testData from '../../../resources/sol/sol';

describe('SOL util library', function () {
  describe('isValidAddress', function () {
    it('should fail to validate invalid addresses', function () {
      for (const address of testData.addresses.invalidAddresses) {
        should.doesNotThrow(() => Utils.isValidAddress(address));
        should.equal(Utils.isValidAddress(address), false);
      }
    });

    it('should succeed to validate valid addresses', function () {
      for (const address of testData.addresses.validAddresses) {
        should.equal(Utils.isValidAddress(address), true);
      }
    });
  });

  describe('isValidBlockId', function () {
    it('should fail to validate invalid Block hashes', function () {
      for (const blockHash of testData.blockHashes.invalidBlockHashes) {
        should.doesNotThrow(() => Utils.isValidBlockId(blockHash));
        should.equal(Utils.isValidBlockId(blockHash), false);
      }
    });

    it('should succeed to validate valid Block hashes', function () {
      for (const blockHash of testData.blockHashes.validBlockHashes) {
        should.equal(Utils.isValidBlockId(blockHash), true);
      }
    });
  });

  describe('isValidPublicKey', function () {
    it('should fail to validate invalid public keys', function () {
      for (const pubKey of testData.pubKeys.invalidPubKeys) {
        should.doesNotThrow(() => Utils.isValidPublicKey(pubKey));
        should.equal(Utils.isValidPublicKey(pubKey), false);
      }
    });

    it('should succeed to validate public keys', function () {
      for (const pubKey of testData.pubKeys.validPubKeys) {
        should.equal(Utils.isValidPublicKey(pubKey), true);
      }
    });
  });

  describe('isValidPrivateKey', function () {
    it('should fail to validate invalid private keys', function () {
      for (const prvKey of testData.prvKeys.invalidPrvKeys) {
        should.doesNotThrow(() => Utils.isValidPrivateKey(prvKey));
        should.equal(Utils.isValidPrivateKey(prvKey), false);
      }
    });

    it('should succeed to validate private keys', function () {
      const validPrvKey = [testData.prvKeys.prvKey1.base58, testData.prvKeys.prvKey1.uint8Array];
      for (const prvKey of validPrvKey) {
        should.equal(Utils.isValidPrivateKey(prvKey), true);
      }
    });
  });

  describe('isValidRawTransaction', function () {
    it('should fail to validate an invalid raw transaction', function () {
      should.doesNotThrow(() => Utils.isValidRawTransaction(testData.INVALID_RAW_TX));
      should.equal(Utils.isValidRawTransaction(testData.INVALID_RAW_TX), false);
    });

    it('should succeed to validate a valid raw transaction', function () {
      const validRawTxs = [testData.RAW_TX_UNSIGNED, testData.RAW_TX_SIGNED];
      for (const rawTx of validRawTxs) {
        should.equal(Utils.isValidRawTransaction(rawTx), true);
      }
    });
  });

  describe('isValidSignature and isValidTransactionId', function () {
    it('should fail to validate invalid signatures', function () {
      for (const signature of testData.signatures.invalidSignatures) {
        should.doesNotThrow(() => Utils.isValidSignature(signature));
        should.equal(Utils.isValidSignature(signature), false);
        should.doesNotThrow(() => Utils.isValidTransactionId(signature));
        should.equal(Utils.isValidTransactionId(signature), false);
      }
    });

    it('should succeed to validate valid signatures', function () {
      for (const signature of testData.signatures.validSignatures) {
        should.equal(Utils.isValidSignature(signature), true);
        should.equal(Utils.isValidTransactionId(signature), true);
      }
    });
  });

  describe('base58 and Uint8Array encoding', function () {
    it('should succeed to base58ToUint8Array', function () {
      should.deepEqual(Utils.base58ToUint8Array(testData.prvKeys.prvKey1.base58), testData.prvKeys.prvKey1.uint8Array);
    });

    it('should succeed to Uint8ArrayTobase58', function () {
      should.deepEqual(Utils.Uint8ArrayTobase58(testData.prvKeys.prvKey1.uint8Array), testData.prvKeys.prvKey1.base58);
    });
  });

  describe('isValidAmount', function () {
    it('should succeed for valid amounts', function () {
      const validAmounts = ['0', '12312312'];
      for (const amount of validAmounts) {
        should.equal(Utils.isValidAmount(amount), true);
      }
    });

    it('should fail for invalid amounts', function () {
      const invalidAmounts = ['-1', 'randomstring', '33.04235'];
      for (const amount of invalidAmounts) {
        should.equal(Utils.isValidAmount(amount), false);
      }
    });
  });

  describe('verifySignature', function () {
    it('should succeed for valid signature in a unsigned tx', function () {
      const signature = '3pD6ayWtvFkn8Fe5efYbSaCYMpnDwzDTmmeoMhcSMAcMrGvmwPFhLxok5vxhHnooA3YSXfnyZgi4e3K3sCHmgU3k';
      Utils.verifySignature(
        testData.TRANSFER_UNSIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE,
        signature,
        testData.authAccount.pub,
      ).should.equal(true);
    });

    it('should succeed for valid signature in a signed tx', function () {
      const signature = '3pD6ayWtvFkn8Fe5efYbSaCYMpnDwzDTmmeoMhcSMAcMrGvmwPFhLxok5vxhHnooA3YSXfnyZgi4e3K3sCHmgU3k';
      Utils.verifySignature(
        testData.TRANSFER_SIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE,
        signature,
        testData.authAccount.pub,
      ).should.equal(true);
    });

    it('should fail for invalid signature', function () {
      const signature = '2QdKALq4adaTahJH13AGzM5bAFuNshw43iQBdVS9D2Loq736zUgPXfHj32cNJKX6FyjUzYJhGfEyAAB5FgYUW6zR';
      Utils.verifySignature(
        testData.TRANSFER_UNSIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE,
        signature,
        testData.authAccount.pub,
      ).should.equal(false);
    });

    it('should fail for invalid pub key', function () {
      const signature = '3pD6ayWtvFkn8Fe5efYbSaCYMpnDwzDTmmeoMhcSMAcMrGvmwPFhLxok5vxhHnooA3YSXfnyZgi4e3K3sCHmgU3k';
      Utils.verifySignature(
        testData.TRANSFER_UNSIGNED_TX_WITH_MEMO_AND_DURABLE_NONCE,
        signature,
        testData.nonceAccount.pub,
      ).should.equal(false);
    });
  });
});
