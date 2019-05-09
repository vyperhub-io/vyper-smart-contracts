var ERC721 = artifacts.require("erc721");

module.exports = function(deployer) {
  deployer.deploy(ERC721);
};
