const erc20 = artifacts.require("erc20");

const args = {
  name: "MyToken",
  symbol: "MT",
  decimals: 18,
  totalSupply: 100000000,
}

contract("ERC20", async accounts => {
  it(`...should set name to ${args.name}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token name
    const erc20_name = await erc20Token.name();
    assert.equal(erc20_name, args.name, "The token name was not correctly set.");
  });

  it(`...should set symbol to ${args.symbol}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token symbol
    const erc20_symbol = await erc20Token.symbol();
    assert.equal(erc20_symbol, args.symbol, "The token symbol was not correctly set.");
  });

  it(`...should set decimals to ${args.decimals}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token decimals
    const erc20_decimals = await erc20Token.decimals();
    assert.equal(erc20_decimals, args.decimals, "The tokens decimals were not correctly set.");
  });

  // TODO: expected <BN: 52b7d2dcc80cd2e4000000> to equal 100000000
  it(`...should set totalSupply to ${args.totalSupply}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token totalSupply
    const erc20_totalSupply = await erc20Token.totalSupply();
    assert.equal(erc20_totalSupply, args.totalSupply, "The tokens totalSupply were not correctly set.");
  });

  it(`...should transfer tokens.`, async () => {
    const account_one = accounts[0];
    const account_two = accounts[1];

    const amount = 100;

    const erc20Token = await erc20.deployed();

    let balance = await erc20Token.balanceOf.call(account_one);

    const account_one_starting_balance = balance.toNumber();

    balance = await erc20Token.balanceOf.call(account_two);
    const account_two_starting_balance = balance.toNumber();
    await erc20Token.transfer(account_two, amount, { from: account_one });

    balance = await erc20Token.balanceOf.call(account_one);
    const account_one_ending_balance = balance.toNumber();

    balance = await erc20Token.balanceOf.call(account_two);
    const account_two_ending_balance = balance.toNumber();

    assert.equal(
      account_one_ending_balance,
      account_one_starting_balance - amount,
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      account_two_ending_balance,
      account_two_starting_balance + amount,
      "Amount wasn't correctly sent to the receiver"
    );

  });

  it(`...should transferFrom tokens.`, async () => {
    const account_one = accounts[0];
    const account_two = accounts[1];

    const amount = 100;

    const erc20Token = await erc20.deployed();

    let balance = await erc20Token.balanceOf.call(account_one);

    const account_one_starting_balance = balance.toNumber();

    balance = await erc20Token.balanceOf.call(account_two);
    const account_two_starting_balance = balance.toNumber();
    await erc20Token.transferFrom(account_one, account_two, amount, { from: account_one });

    balance = await erc20Token.balanceOf.call(account_one);
    const account_one_ending_balance = balance.toNumber();

    balance = await erc20Token.balanceOf.call(account_two);
    const account_two_ending_balance = balance.toNumber();

    assert.equal(
      account_one_ending_balance,
      account_one_starting_balance - amount,
      "Amount wasn't correctly transfered from the sender"
    );
    assert.equal(
      account_two_ending_balance,
      account_two_starting_balance + amount,
      "Amount wasn't correctly transfered to the receiver"
    );

  });
});
