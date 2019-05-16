var LOPB = artifacts.require("linear_optimization_problem_bounty");

module.exports = function(deployer) {
  const durationInBlocks = 100;
  deployer.deploy(durationInBlocks);
};
