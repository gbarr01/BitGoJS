/**
 * Create a new receive address on an existing multi-sig ethereum wallet at BitGo.
 *
 * Copyright 2021, BitGo, Inc.  All Rights Reserved.
 */
 const BitGoJS = require('bitgo');
 const Promise = require('bluebird');

 // change this to env: 'production' when you are ready for production
 const bitgo = new BitGoJS.BitGo({ env: 'test' });

 // Change coin to 'eth' when working with production
 const coin = 'teth';
 // TODO: set your access token here
 const accessToken = '';

 // set your wallet from the YYYYY parameter here in the URL on app.bitgo-test.com
 // https://test.bitgo.com/enterprise/XXXXXXXXX/coin/teth/YYYYY/transactions
 const walletId = '';

 // ETH only parameter -
 // Use 0 for the old forwarder (https://github.com/BitGo/eth-multisig-v2),
 // and 1 for the new fee-improved forwarder (https://github.com/BitGo/eth-multisig-v4).
 const forwarderVersion = 1;

 Promise.coroutine(function *() {
   bitgo.authenticateWithAccessToken({ accessToken: accessToken });

   const wallet = yield bitgo.coin(coin).wallets().get({ id: walletId });

   const newReceiveAddress = yield wallet.createAddress({ forwarderVersion: forwarderVersion });

   console.log('Wallet ID:', wallet.id());
   console.log('First Receive Address:', wallet.receiveAddress());
   console.log('Second Receive Address:', newReceiveAddress);
 })().catch(e => console.error(e));
