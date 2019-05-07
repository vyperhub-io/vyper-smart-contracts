const erc20 = artifacts.require("erc20");

const args = {
  name: "MyToken",
  symbol: "MT",
  decimals: 18,
  totalSupply: 100000000,
}

contract("ERC20", () => {
  it(`...should set name to ${args.name}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token name
    const erc20Name = await erc20Token.name();
    assert.equal(erc20Name, args.name, "The token name was not correctly set.");
  });

  it(`...should set symbol to ${args.symbol}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token symbol
    const erc20Symbol = await erc20Token.symbol();
    assert.equal(erc20Symbol, args.symbol, "The token symbol was not correctly set.");
  });

  it(`...should set decimals to ${args.decimals}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token decimals
    const erc20Decimals = await erc20Token.decimals();
    assert.equal(erc20Decimals, args.decimals, "The tokens decimals were not correctly set.");
  });

  // TODO: expected <BN: 52b7d2dcc80cd2e4000000> to equal 100000000
  it(`...should set totalSupply to ${args.totalSupply}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token totalSupply
    const erc20TotalSupply = await erc20Token.totalSupply();
    assert.equal(erc20TotalSupply, args.totalSupply, "The tokens totalSupply were not correctly set.");
  });
});
