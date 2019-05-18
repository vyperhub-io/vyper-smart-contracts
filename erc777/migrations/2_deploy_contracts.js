var ERC777 = artifacts.require("erc777");

module.exports = function(deployer) {
  const name = "MyToken";
  const symbol = "MT";
  const totalSupply = 100000000;
  const granularity = 1;
  const defaultOperators = [];

  deployer.deploy(ERC777, name, symbol, totalSupply, granularity, defaultOperators);
};
