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
  it(`...should set totalSupply to ${args.totalSupply * 10 ** args.decimals}.`, async () => {
    const erc20Token = await erc20.deployed({...args});
    // get token totalSupply
    let erc20_totalSupply = await erc20Token.totalSupply();
    erc20_totalSupply = erc20_totalSupply.toString();
    const actual_totalSupply = args.totalSupply * 10 ** args.decimals;
    assert.equal(erc20_totalSupply, actual_totalSupply, "The tokens totalSupply were not correctly set.");
  });

  it("...should transfer tokens.", async () => {
    const sender = accounts[0];
    const receiver = accounts[1];

    const amount = 100;

    const erc20Token = await erc20.deployed({...args});

    let balance = await erc20Token.balanceOf.call(sender);
    const sender_starting_balance = balance.toString();

    balance = await erc20Token.balanceOf.call(receiver);
    const receiver_starting_balance = balance.toString();

    await erc20Token.transfer(receiver, amount, { from: sender });

    balance = await erc20Token.balanceOf.call(sender);
    const sender_ending_balance = balance.toString();

    balance = await erc20Token.balanceOf.call(receiver);
    const receiver_ending_balance = balance.toString();

    assert.equal(
      sender_ending_balance,
      sender_starting_balance - amount,
      "Amount wasn't correctly taken from the sender"
    );
    assert.equal(
      receiver_ending_balance - amount,
      receiver_starting_balance,
      "Amount wasn't correctly sent to the receiver"
    );
  });

  it("...should approve amount.", async () => {
    const owner = accounts[0];
    const spender = accounts[1];

    const amount = 100;
    const erc20Token = await erc20.deployed();

    // get allowance before 'approve'
    let allowance = await erc20Token.allowance.call(owner, spender);
    const spender_allowance_before = allowance.toString();

    // approve 'amount'
    await erc20Token.approve(spender, amount, { from: owner });

    // get allowance after 'approve'
    allowance = await erc20Token.allowance.call(owner, spender);
    const spender_allowance_after = allowance.toString();

    assert.equal(
      spender_allowance_before,
      spender_allowance_after - amount,
      "Amount wasn't correctly approved"
    );
  });

  it("...should transferFrom tokens.", async () => {
    const owner = accounts[0];
    const sender = accounts[1];

    const amount = 100;

    const erc20Token = await erc20.deployed({...args});

    allowance = await erc20Token.allowance.call(owner, sender);
    const sender_starting_allowance = allowance.toString();

    let balance = await erc20Token.balanceOf.call(sender);
    const sender_starting_balance = balance.toString();

    balance = await erc20Token.balanceOf.call(owner);
    const owner_starting_balance = balance.toString();

    // 'sender/operator' transfers tokens of 'owner' to himself
    await erc20Token.transferFrom(owner, sender, amount, { from: sender });

    balance = await erc20Token.balanceOf.call(sender);
    const sender_ending_balance = balance.toString();

    balance = await erc20Token.balanceOf.call(owner);
    const owner_ending_balance = balance.toString();

    allowance = await erc20Token.allowance.call(owner, sender);
    const sender_ending_allowance = allowance.toString();

    assert.equal(
      owner_starting_balance - amount,
      owner_ending_balance,
      "Amount wasn't correctly transfered from the owner"
    );
    assert.equal(
      sender_starting_balance,
      sender_ending_balance - amount,
      "Amount wasn't correctly transfered to the sender"
    );
    assert.equal(
      sender_starting_allowance - amount,
      sender_ending_allowance,
      "Allowance of sender wasn't correctly updated"
    );
  });

});
