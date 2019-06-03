const erc20  = artifacts.require('erc20');
const erc721 = artifacts.require('erc721');
const erc777 = artifacts.require('erc777');
const wallet = artifacts.require('wallet');

const truffleFromAddress = '0x954e72fdc51Cf919203067406fB337Ed4bDC8CdA';

const args = {
  erc20: {
    name: 'My20Token',
    symbol: 'MT20',
    decimals: 18,
    totalSupply: 100000000,
  },
  erc777: {
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
}

module.exports = function(deployer) {
  if (deployer.network == 'ganache') {
    // deploy contracts necessary for testing
    deployer.deploy(
      erc20,
      args.erc20.name,
      args.erc20.symbol,
      args.erc20.decimals,
      args.erc20.totalSupply,
    );

    deployer.deploy(erc721);

    deployer.deploy(
      erc777,
      args.erc777.name,
      args.erc777.symbol,
      args.erc777.totalSupply,
      args.erc777.granularity,
      args.erc777.defaultOperators,
    );
  } // if deployer.network == 'ganache'

  // deploy wallet contract
  deployer.deploy(wallet);
};
