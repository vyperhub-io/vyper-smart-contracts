const erc20  = artifacts.require('erc20');
const erc721 = artifacts.require('erc721');
const erc777 = artifacts.require('erc777');

const walletAbstraction = artifacts.require('wallet');

let wallet, walletOwner;

contract('wallet', accounts => {
  beforeEach(async () => {
    wallet = await walletAbstraction.new({ from: accounts[0] });
    walletOwner = accounts[0];
  });

  it('...should accept erc20 tokens deposit.', async () => {
    const sender = accounts[0];

    const erc20Token = await erc20.deployed();

    let balance = await erc20Token.balanceOf.call(wallet.address);
    const wallet_starting_balance = balance.toString();

    const amount = 100;

    await erc20Token.transfer(wallet.address, amount, { from: sender });

    balance = await erc20Token.balanceOf.call(wallet.address);
    const wallet_ending_balance = balance.toString();

    assert.equal(
      wallet_starting_balance,
      wallet_ending_balance - amount,
      'ERC20 tokens were not correctly deposited'
    );
  });

  it('...should send erc20 tokens.', async () => {
    const receiver = accounts[1];

    const amount = 100;

    const erc20Token = await erc20.deployed();
    await erc20Token.transfer(wallet.address, amount, { from: accounts[0] });

    //let balance = await erc20Token.balanceOf.call(wallet.address);
    //const wallet_starting_balance = balance.toString();

    let balance = await erc20Token.balanceOf.call(receiver);
    const receiver_starting_balance = balance.toString();

    await wallet.sendERC20(erc20Token.address, receiver, amount, { from: walletOwner, gas: 4000000 });

    //balance = await erc20Token.balanceOf.call(wallet.address);
    //const wallet_ending_balance = balance.toString();

    balance = await erc20Token.balanceOf.call(receiver);
    const receiver_ending_balance = balance.toString();

    assert.equal(
      receiver_starting_balance,
      receiver_ending_balance - amount,
      'ERC20 tokens were not correctly credited'
    );
  });

  it('...should accept erc721 token deposit.', async () => {
    const sender = accounts[0];

    const erc721Token = await erc721.deployed();

    const mintReturnData = await erc721Token.mint();
    const tokenId = mintReturnData.logs[0].args['1'].toString();

    let balance = await erc721Token.balanceOf.call(wallet.address);
    const wallet_starting_balance = balance.toString();

    await erc721Token.transferFrom(sender, wallet.address, tokenId, { from: sender });

    balance = await erc721Token.balanceOf.call(wallet.address);
    const wallet_ending_balance = balance.toString();

    const ownerOfNFT = await erc721Token.ownerOf.call(tokenId);

    assert.equal(
      wallet_starting_balance,
      wallet_ending_balance - 1,
      'ERC721 token was not correctly deposited'
    );
    assert.equal(
      wallet.address,
      ownerOfNFT,
      'ERC721 token was not correctly deposited'
    );
  });

  it('...should accept erc777 tokens deposit.', async () => {
    const amount = 80;

    const erc777Token = await erc777.deployed();

    let balance = await erc777Token.balanceOf.call(wallet.address);
    const wallet_starting_balance = balance.toString();

    await erc777Token.mint(wallet.address, amount);

    balance = await erc777Token.balanceOf.call(wallet.address);
    const wallet_ending_balance = balance.toString();

    assert.equal(
      wallet_starting_balance,
      wallet_ending_balance - amount,
      'ERC777 token was not correctly deposited'
    );
  });

  it('...should send erc777 tokens.', async () => {
    const receiver = accounts[1];

    const amount = 120;

    const erc777Token = await erc777.deployed();
    await erc777Token.mint(wallet.address, amount);

    let balance = await erc777Token.balanceOf.call(wallet.address);
    const wallet_starting_balance = balance.toString();

    await wallet.sendERC777(erc777Token.address, receiver, amount, { from: walletOwner, gas: 3000000 });

    balance = await erc777Token.balanceOf.call(wallet.address);
    const wallet_ending_balance = balance.toString();

    assert.equal(
      wallet_starting_balance - amount,
      wallet_ending_balance,
      'ERC777 token was not correctly transfered'
    );
  });

});
