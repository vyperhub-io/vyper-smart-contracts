var LOPB = artifacts.require("linear_optimization_problem_bounty");

module.exports = function(deployer) {
  deployer.deploy(LOPB);
};
