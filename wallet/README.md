# Wallet

This wallet contract is capable of receiving, holding and sending Ether as well as tokens that comply with one
of the following standards:

* [ERC20](https://eips.ethereum.org/EIPS/eip-20)
* [ERC721](https://eips.ethereum.org/EIPS/eip-721)
* [ERC777](https://eips.ethereum.org/EIPS/eip-777)

## Run tests

```bash
$ truffle test --network ganache
```

The `wallet` contract accesses the `ERC1820Registry` contract in its constructor.
It is therefore necessary that the `ERC1820Registry` contract exists on the (test) network to where the `wallet` contract gets deployed.
In `migrations/1_initial_migration.js` a check is performed to determine if the `ERC1820Registry` contract exists - if it doesn't it is deployed.
