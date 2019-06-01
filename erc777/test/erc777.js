const erc777 = artifacts.require("erc777");

// Tests for this implementation can be found here:
// https://github.com/0xjac/ERC777/tree/master/test

const args = {
  name: "MyToken",
  symbol: "MT",
  totalSupply: 100000000,
  granularity: 1,
  defaultOperators: [],
}

contract("ERC777", async accounts => {

});
