const erc777 = artifacts.require('erc777');

// NOTE: this address has to match the 'from' address used in 'truffle.js'
const truffleFromAddress = '0x954e72fdc51Cf919203067406fB337Ed4bDC8CdA';

const args = {
  name: 'My777Token',
  symbol: 'MT777',
  totalSupply: 100000000,
  granularity: 1,
  defaultOperators: [
    truffleFromAddress,
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
    '0x0000000000000000000000000000000000000003',
  ],
}

module.exports = function(deployer) {
  deployer.deploy(
    erc777,
    args.name,
    args.symbol,
    args.totalSupply,
    args.granularity,
    args.defaultOperators
  );
};
