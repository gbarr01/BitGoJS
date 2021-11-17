/**
 * @prettier
 */

import { getUtxoCoin } from '../util';

describe('Custom BCH Tests', function () {
  const bch = getUtxoCoin('bch');
  const tbch = getUtxoCoin('tbch');

  // we use mainnet bch so we can reuse the mainnet address examples
  it('should correctly convert addresses', function () {
    // P2PKH cashaddr -> cashaddr
    bch
      .canonicalAddress('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a', 'cashaddr')
      .should.equal('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a');
    // TODO(BG-11325): remove bech32 in future major version release
    bch
      .canonicalAddress('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a', 'bech32')
      .should.equal('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a');

    // P2PKH base58 -> cashaddr
    bch
      .canonicalAddress('1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu', 'cashaddr')
      .should.equal('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a');
    // TODO(BG-11325): remove bech32 in future major version release
    bch
      .canonicalAddress('1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu', 'bech32')
      .should.equal('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a');

    // P2SH cashaddr -> cashaddr
    bch
      .canonicalAddress('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq', 'cashaddr')
      .should.equal('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq');
    // TODO(BG-11325): remove bech32 in future major version release
    bch
      .canonicalAddress('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq', 'bech32')
      .should.equal('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq');

    // P2SH base58 -> cashaddr
    bch
      .canonicalAddress('3CWFddi6m4ndiGyKqzYvsFYagqDLPVMTzC', 'cashaddr')
      .should.equal('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq');
    // TODO(BG-11325): remove bech32 in future major version release
    bch
      .canonicalAddress('3CWFddi6m4ndiGyKqzYvsFYagqDLPVMTzC', 'bech32')
      .should.equal('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq');

    // no 'bitcoincash:' prefix
    bch
      .canonicalAddress('ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq', 'cashaddr')
      .should.equal('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq');
    // TODO(BG-11325): remove bech32 in future major version release
    bch
      .canonicalAddress('ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq', 'bech32')
      .should.equal('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq');

    // P2PKH cashaddr -> base58
    bch
      .canonicalAddress('bitcoincash:qqq3728yw0y47sqn6l2na30mcw6zm78dzqre909m2r', 'base58')
      .should.equal('16w1D5WRVKJuZUsSRzdLp9w3YGcgoxDXb');

    // P2PKH base58 -> base58
    bch
      .canonicalAddress('16w1D5WRVKJuZUsSRzdLp9w3YGcgoxDXb', 'base58')
      .should.equal('16w1D5WRVKJuZUsSRzdLp9w3YGcgoxDXb');

    // P2SH cashaddr -> base58
    bch
      .canonicalAddress('bitcoincash:pr95sy3j9xwd2ap32xkykttr4cvcu7as4yc93ky28e', 'base58')
      .should.equal('3LDsS579y7sruadqu11beEJoTjdFiFCdX4');

    // P2SH base58 -> base58
    bch
      .canonicalAddress('3LDsS579y7sruadqu11beEJoTjdFiFCdX4', 'base58')
      .should.equal('3LDsS579y7sruadqu11beEJoTjdFiFCdX4');

    // undefined version defaults to base58
    bch
      .canonicalAddress('bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq')
      .should.equal('3CWFddi6m4ndiGyKqzYvsFYagqDLPVMTzC');

    // all capitalized
    bch
      .canonicalAddress('bitcoincash:QQQ3728YW0Y47SQN6L2NA30MCW6ZM78DZQRE909M2R', 'base58')
      .should.equal('16w1D5WRVKJuZUsSRzdLp9w3YGcgoxDXb');

    // testnet addresses
    tbch
      .canonicalAddress('2NCEDmmKNNnqKvnWw7pE3RLzuFe5aHHVy1X', 'cashaddr')
      .should.equal('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f');
    // TODO(BG-11325): remove bech32 in future major version release
    tbch
      .canonicalAddress('2NCEDmmKNNnqKvnWw7pE3RLzuFe5aHHVy1X', 'bech32')
      .should.equal('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f');
    tbch
      .canonicalAddress('n3jYBjCzgGNydQwf83Hz6GBzGBhMkKfgL1', 'cashaddr')
      .should.equal('bchtest:qremgr9dr9x5swv82k69qdjzrvdxgkaaesftdp5xla');
    // TODO(BG-11325): remove bech32 in future major version release
    tbch
      .canonicalAddress('n3jYBjCzgGNydQwf83Hz6GBzGBhMkKfgL1', 'bech32')
      .should.equal('bchtest:qremgr9dr9x5swv82k69qdjzrvdxgkaaesftdp5xla');
    tbch
      .canonicalAddress('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f', 'cashaddr')
      .should.equal('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f');
    // TODO(BG-11325): remove bech32 in future major version release
    tbch
      .canonicalAddress('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f', 'bech32')
      .should.equal('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f');
    tbch
      .canonicalAddress('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f', 'base58')
      .should.equal('2NCEDmmKNNnqKvnWw7pE3RLzuFe5aHHVy1X');
    tbch
      .canonicalAddress('prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f', 'base58')
      .should.equal('2NCEDmmKNNnqKvnWw7pE3RLzuFe5aHHVy1X');
    tbch
      .canonicalAddress('prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f', 'cashaddr')
      .should.equal('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f');
    // TODO(BG-11325): remove bech32 in future major version release
    tbch
      .canonicalAddress('prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f', 'bech32')
      .should.equal('bchtest:prgrnjengs555k3cff2s3gqxg3xyyr9uzyh9js5m8f');
  });

  it('should reject invalid addresses', function () {
    // improperly short data segment
    (() => {
      bch.canonicalAddress('bitcoincash:sy3j9xwd2ap32xkykttr4cvcu7as4yc93ky28e', 'base58');
    }).should.throw();

    // mismatched data segment (cashaddr)
    (() => {
      bch.canonicalAddress('bitcoincash:yr95sy3j9xwd2ap32xkykttr4cvcu7as4yc93ky28e', 'base58');
    }).should.throw();

    // double prefix
    (() => {
      bch.canonicalAddress('bitcoincash:bitcoincash:pr95sy3j9xwd2ap32xkykttr4cvcu7as4yc93ky28e', 'base58');
    }).should.throw();

    // mismatched data segment (base58)
    (() => {
      bch.canonicalAddress('3DDsS579y7sruadqu11beEJoTjdFiFCdX4', 'base58');
    }).should.throw();

    // improper prefix
    (() => {
      bch.canonicalAddress(':qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a', 'base58');
    }).should.throw();

    (() => {
      bch.canonicalAddress('bitcoin:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a', 'base58');
    }).should.throw();

    // mismatched capitalization
    (() => {
      bch.canonicalAddress('bitcoincash:QPM2Qsznhks23z7629mms6s4cwef74vcwvy22gdx6a', 'cashaddr');
    }).should.throw();

    // TODO(BG-11325): remove bech32 in future major version release
    (() => {
      bch.canonicalAddress('bitcoincash:QPM2Qsznhks23z7629mms6s4cwef74vcwvy22gdx6a', 'bech32');
    }).should.throw();

    // improper version
    (() => {
      bch.canonicalAddress('bitcoincash:qqq3728yw0y47sqn6l2na30mcw6zm78dzqre909m2r', 'blah');
    }).should.throw();

    // undefined address
    (() => {
      bch.canonicalAddress(undefined as any, 'blah');
    }).should.throw();
  });
});
