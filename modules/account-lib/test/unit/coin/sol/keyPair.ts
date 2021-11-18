import should from 'should';
import * as testData from '../../../resources/sol/sol';
import { Sol } from '../../../../src';

describe('Sol KeyPair', function () {
  const defaultSeed = { seed: testData.accountWithSeed.seed };

  describe('should create a valid KeyPair', () => {
    it('from an empty value', () => {
      const keyPair = new Sol.KeyPair();
      should.exists(keyPair.getKeys().prv);
      should.exists(keyPair.getKeys().pub);
      keyPair.getKeys().prv?.length.should.be.belowOrEqual(88);
      keyPair.getKeys().prv?.length.should.be.aboveOrEqual(76);
      keyPair.getKeys().pub.length.should.be.belowOrEqual(44);
      keyPair.getKeys().pub.length.should.be.aboveOrEqual(32);
    });

    it('from a private key', () => {
      const keyPair = new Sol.KeyPair({ prv: testData.accountWithSeed.privateKey.base58 });
      should.equal(keyPair.getKeys().pub, testData.accountWithSeed.publicKey);
      should.equal(keyPair.getKeys().prv, testData.accountWithSeed.privateKey.base58);
      should.equal(keyPair.getKeys(true).pub, testData.accountWithSeed.publicKey);
      should.deepEqual(keyPair.getKeys(true).prv, testData.accountWithSeed.privateKey.uint8Array);
    });

    it('from an public key', () => {
      const keyPair = new Sol.KeyPair({ pub: testData.accountWithSeed.publicKey });
      should.equal(keyPair.getKeys().pub, testData.accountWithSeed.publicKey);
    });
  });

  describe('should fail to create a KeyPair', function () {
    it('from an invalid seed', () => {
      const seed = { seed: Buffer.alloc(8) }; //  Seed should be 512 bits (64 bytes)
      should.throws(() => new Sol.KeyPair(seed));
    });

    it('from an invalid public key', () => {
      const source = {
        pub: '01D63D',
      };
      should.throws(() => new Sol.KeyPair(source));
    });

    it('from an invalid private key', () => {
      const source = {
        prv: '82A34E',
      };
      should.throws(() => new Sol.KeyPair(source));
    });
  });

  describe('getAddress', function () {
    it('should get an address', () => {
      const keyPair = new Sol.KeyPair(defaultSeed);
      const address = keyPair.getAddress();
      address.should.equal(testData.accountWithSeed.publicKey);
    });
  });

  describe('getKeys', function () {
    it('should get public keys in base58 and private in Uint8Array', () => {
      const keyPair = new Sol.KeyPair(defaultSeed);
      const { prv, pub } = keyPair.getKeys(true);
      prv?.should.deepEqual(testData.accountWithSeed.privateKey.uint8Array);
      pub.should.equal(testData.accountWithSeed.publicKey);
    });

    it('should get private and public keys base58', () => {
      const keyPair = new Sol.KeyPair(defaultSeed);
      const { prv, pub } = keyPair.getKeys();
      prv?.should.equal(testData.accountWithSeed.privateKey.base58);
      pub.should.equal(testData.accountWithSeed.publicKey);
    });

    it('should get private and public keys for a random seed', () => {
      const keyPair = new Sol.KeyPair();
      const { prv, pub } = keyPair.getKeys();
      should.exist(prv);
      should.exist(pub);
    });
  });
});
