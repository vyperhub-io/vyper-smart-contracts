const erc777 = artifacts.require("erc777");

const args = {
  name: "MyToken",
  symbol: "MT",
  totalSupply: 100000000,
  granularity: 1,
  defaultOperators: [],
}

contract("ERC777", async accounts => {

});
