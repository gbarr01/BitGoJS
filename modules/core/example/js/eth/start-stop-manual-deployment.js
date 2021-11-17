/**
 * Set/Unset forwarder to deploy and flush manually.
 *
 * Copyright 2021 BitGo, Inc. All Rights Reserved.
 */

const BitGoJS = require('bitgo');
const bitgo = new BitGoJS.BitGo({ env: 'test' });
const Promise = require('bluebird');

// TODO: set your access token here
const accessToken = '';

// set your wallet from the YYYYY parameter here in the URL on app.bitgo-test.com
// https://test.bitgo.com/enterprise/XXXXXXXXX/coin/talgo/YYYYY/transactions
const walletId = '';

// Change coin to 'eth' when working with production
const coin = 'teth';

const url = 'https://app.bitgo-test.com/api/v2/' + coin + '/wallet/' + walletId;

// Create the wallet
Promise.coroutine(function *() {
  bitgo.authenticateWithAccessToken({ accessToken });

  // set to 'true' to start manual deployment and 'false' to stop manual deployment
  const deployForwardersManually = true;
  // set to 'true' to start manual flushing and 'false' to stop manual flushing
  const flushForwardersManually = true;

  // Refer https://app.bitgo.com/docs/#operation/v2.wallet.get for all different payload options
  const ethSpecificPayload = { [coin]: { deployForwardersManually: deployForwardersManually, flushForwardersManually: flushForwardersManually } } ;
  const body = { approvalsRequired: 1, coinSpecific: ethSpecificPayload };

  const response = yield bitgo.put(url).send(body).result();

  console.log(`Wallet ID:, ${response.id}`);
  console.log(`Wallet Label:, ${response.label}`);
  console.log(`Enterprise:, ${response.enterprise}`);
  console.log(`Wallet Version:, ${response.coinSpecific.walletVersion}`);
  console.log(`Deploy Forwarders Manually:, ${response.coinSpecific.deployForwardersManually}`);
  console.log(`Flush Forwarders Manually:, ${response.coinSpecific.flushForwardersManually}`);

})();
