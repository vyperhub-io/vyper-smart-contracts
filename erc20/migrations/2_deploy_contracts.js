var ERC20 = artifacts.require("erc20");

module.exports = function(deployer) {
  const name = "MyToken";
  const symbol = "MT";
  const decimals = 18;
  const totalSupply = 100000000;
  deployer.deploy(ERC20, name, symbol, decimals, totalSupply);
};
