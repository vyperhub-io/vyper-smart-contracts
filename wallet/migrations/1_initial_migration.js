const checkForERC182Registry = require('./helpers/checkForERC182Registry.js');

const Migrations = artifacts.require('./Migrations.sol');

module.exports = async function(deployer) {
  await checkForERC182Registry(web3, deployer);

  deployer.deploy(Migrations);
};
