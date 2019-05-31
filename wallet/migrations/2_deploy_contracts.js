var wallet = artifacts.require("wallet");

module.exports = async function(deployer) {
  deployer.deploy(wallet);
};
