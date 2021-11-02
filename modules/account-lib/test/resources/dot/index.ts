export const accounts = {
  account1: {
    secretKey: '874578010603af8e93b44bfc1d13b32830d0dbca6c89f28ccdc662afd3cdc824',
    publicKey: '61b18c6dc02ddcabdeac56cb4f21a971cc41cc97640f6f85b073480008c53a0d',
    address: '5EGoFA95omzemRssELLDjVenNZ68aXyUeqtKQScXSEBvVJkr',
  },
  account2: {
    secretKey: '6f850d17c2bf64478a2aac860fe9c23a48d322f12932c43fe90704553b7b84fd',
    publicKey: '9f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f0254',
    address: '5Ffp1wJCPu4hzVDTo7XaMLqZSvSadyUQmxWPDw74CBjECSoq',
  },
  account3: {
    secretKey: 'ff2f0c73e7e8a34ba80401efa06f16cbb3406ca1f04b4fc618bc937643eef498',
    publicKey: 'd472bd6e0f1f92297631938e30edb682208c2cd2698d80cf678c53a69979eb9f',
    address: '5GsG6P9EqkbmTrM1GE5bcQx9nsSq74KueiLa1kNZiwagFxW4',
  },
  account4: {
    secretKey: '1c096bd907cc0149661a153431004ac40743330f9f0a2d03627628e16eeda1a8',
    publicKey: '7788327c695dca4b3e649a0db45bc3e703a2c67428fce360e61800cc4248f4f7',
    address: '5EmS1nuXogd8JXCUfyMjYBZ3MNbvPSBB4uNRjKGFS6E68YbK',
  },
  default: {
    secretKey: '0000000000000000000000000000000000000000000000000000000000000000',
    publicKey: '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29',
    address: '5DQcDYQ3wwobcrJ5aE5CzGp34ZWYNeYfYZ1yLbPiU2RcSvwm',
  },
};

export const rawTx = {
  transfer: {
    signed:
      '0x4502840061b18c6dc02ddcabdeac56cb4f21a971cc41cc97640f6f85b073480008c53a0d0050d7217d4c3220cbda68ddce82d5669a99a181393daf391bb9e455d94d9de5da80c2066092515ce219ebe0e78098f3b64c86e7148f6663a3ef7be2e6caed4808d5012103000503009f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f0254070010a5d4e8',
    unsigned:
      '0xa40503009f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f0254070010a5d4e8d5012103008c230000070000002b8d4fdbb41f4bc15b8a7ec8ed0687f2a1ae11e0fc2dc6604fa962a9421ae349149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d',
  },
  stake: {
    signed:
      '0x4d02840061b18c6dc02ddcabdeac56cb4f21a971cc41cc97640f6f85b073480008c53a0d002f727310a5a1e2991edd4c51d723f0cdc4c065f7139a678ede2a27147953477490b50b4c5d8110ab38799e1ca1b627bb79014c9fb14c7b7733c24984ef2af90bd5012103000700009f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f02540b00203d88792d00',
    unsigned:
      '0xac0700009f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f02540b00203d88792d00d5012103008c230000070000002b8d4fdbb41f4bc15b8a7ec8ed0687f2a1ae11e0fc2dc6604fa962a9421ae349149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d',
    signedAlt:
      '0xcd02840061b18c6dc02ddcabdeac56cb4f21a971cc41cc97640f6f85b073480008c53a0d0095ee836583f76fd084920a035ff9919da6836fc14280fbda7bbc9b7096ab0f0501cd46070ba6876cbe4f46a3919da4ac99f3a65d3dd69336c12e1a6b9cae4808d5012103000700009f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f02540b00203d88792d039f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f0254',
    unsignedAlt:
      '0x2d010700009f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f02540b00203d88792d039f7b0675db59d19b4bd9c8c72eaabba75a9863d02b30115b8b3c3ca5c20f0254d5012103008c230000070000002b8d4fdbb41f4bc15b8a7ec8ed0687f2a1ae11e0fc2dc6604fa962a9421ae349149799bc9602cb5cf201f3425fb8d253b2d4e61fc119dcab3249f307f594754d',
  },
};
