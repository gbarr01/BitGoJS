/**
 * @prettier
 */
import 'should';
import * as assert from 'assert';
import * as utxolib from '@bitgo/utxo-lib';
import { Codes } from '@bitgo/unspents';

import { AbstractUtxoCoin } from '../../../../../src/v2/coins';
import { GenerateAddressOptions } from '../../../../../src/v2/coins/abstractUtxoCoin';

import { utxoCoins, keychains as keychainsBip32, getFixture, shouldEqualJSON } from './util';

function isCompatibleAddress(a: AbstractUtxoCoin, b: AbstractUtxoCoin): boolean {
  if (a === b) {
    return true;
  }
  switch (a.getChain()) {
    case 'btc':
    case 'bsv':
    case 'bch':
      return ['btc', 'bsv', 'bch'].includes(b.getChain());
    case 'tbtc':
    case 'tbsv':
    case 'tbch':
      return ['tbtc', 'tbsv', 'tbch'].includes(b.getChain());
    default:
      return false;
  }
}

function run(coin: AbstractUtxoCoin) {
  const keychains = keychainsBip32.map((k) => ({ pub: k.neutered().toBase58() }));

  const chains = [...Codes.all].sort((a, b) => a - b);

  function getParameters(): GenerateAddressOptions[] {
    return [undefined, ...chains].map((chain) => ({ keychains, chain }));
  }

  describe(`UTXO Addresses ${coin.getChain()}`, function () {
    it('address support', function () {
      const supportedAddressTypes = utxolib.bitgo.outputScripts.scriptTypes2Of3.filter((t) =>
        coin.supportsAddressType(t)
      );
      switch (coin.getChain()) {
        case 'btc':
        case 'tbtc':
          supportedAddressTypes.should.eql(['p2sh', 'p2shP2wsh', 'p2wsh', 'p2tr']);
          break;
        case 'btg':
        case 'tbtg':
        case 'ltc':
        case 'tltc':
          supportedAddressTypes.should.eql(['p2sh', 'p2shP2wsh', 'p2wsh']);
          break;
        case 'bch':
        case 'tbch':
        case 'bsv':
        case 'tbsv':
        case 'dash':
        case 'tdash':
        case 'zec':
        case 'tzec':
          supportedAddressTypes.should.eql(['p2sh']);
          break;
        default:
          throw new Error(`unexpected coin ${coin.getChain()}`);
      }
    });

    it('generates address matching the fixtures', async function () {
      const addresses = getParameters().map((p) => {
        const label = { chain: p.chain === undefined ? 'default' : p.chain };
        try {
          return [label, coin.generateAddress(p)];
        } catch (e) {
          return [label, { error: e.message }];
        }
      });

      shouldEqualJSON(addresses, await getFixture(coin, 'addresses-by-chain', addresses));
    });

    it('validates and verifies generated addresses', function () {
      getParameters().forEach((p) => {
        if (p.chain && !coin.supportsAddressChain(p.chain)) {
          assert.throws(() => coin.generateAddress(p));
          return;
        }

        const a = coin.generateAddress(p);
        coin.isValidAddress(a.address).should.eql(true);
        coin.verifyAddress({ ...a, keychains });
      });
    });

    it('defaults to canonical address', function () {
      getParameters().forEach((p) => {
        if (!p.chain || coin.supportsAddressChain(p.chain)) {
          const address = coin.generateAddress(p).address;
          coin.canonicalAddress(address).should.eql(address);
        }
      });
    });

    utxoCoins.forEach((otherCoin) => {
      it(`has expected address compatability with ${otherCoin.getChain()}`, async function () {
        getParameters().forEach((p) => {
          if (p.chain && (!coin.supportsAddressChain(p.chain) || !otherCoin.supportsAddressChain(p.chain))) {
            return;
          }
          const address = coin.generateAddress(p);
          const otherAddress = otherCoin.generateAddress(p);
          (address.address === otherAddress.address).should.eql(isCompatibleAddress(coin, otherCoin));
          coin.isValidAddress(otherAddress.address).should.eql(isCompatibleAddress(coin, otherCoin));
        });
      });
    });
  });
}

utxoCoins.forEach((c) => run(c));
