const erc777 = artifacts.require('erc777');
const erc1820Registry = artifacts.require('ERC1820Registry');

const truffleFromAddress = '0x954e72fdc51Cf919203067406fB337Ed4bDC8CdA';

const args = {
  name: 'My777Token',
  symbol: 'MT777',
  totalSupply: 100000000,
  granularity: 10,
  defaultOperators: [
    truffleFromAddress,
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
    '0x0000000000000000000000000000000000000003',
  ],
}

let defaultOperator,
    holder,
    operator,
    receiver,

    erc777Token,

    zeroAddress;

contract('ERC777', async accounts => {
  beforeEach(async () => {
    defaultOperator = accounts[0];
             holder = accounts[1];
           operator = accounts[2];
           receiver = accounts[3];
        zeroAddress = '0x0000000000000000000000000000000000000000'

    erc777Token = await erc777.new(
      args.name,
      args.symbol,
      args.totalSupply,
      args.granularity,
      args.defaultOperators,
      { from: defaultOperator }
    );
  });

  it('...should set correct vanity information', async () => {
    const name = await erc777Token.name.call();
    assert.strictEqual(name, args.name);

    const symbol = await erc777Token.symbol.call();
    assert.strictEqual(symbol, args.symbol);

    const totalSupply = await erc777Token.totalSupply.call();
    assert.strictEqual(totalSupply.toNumber(), args.totalSupply);

    const granularity = await erc777Token.granularity.call();
    assert.strictEqual(granularity.toNumber(), args.granularity);

    const defaultOperators = await erc777Token.defaultOperators.call();
    assert.strictEqual(defaultOperators.toString(), args.defaultOperators.toString());
  });

  it('...should register ERC1820 `ERC777Token` interface.', async () => {
    const erc1820JsonInterface = erc1820Registry.abi;
    const erc1820Address = '0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24';
    const erc1820Instance = new web3.eth.Contract(erc1820JsonInterface, erc1820Address);

    const interfaceHash = web3.utils.keccak256('ERC777Token');
    const interfaceHash_implementer = await erc1820Instance.methods.getInterfaceImplementer(erc777Token.address, interfaceHash).call();

    const interfaceHash_correct = '0xac7fbab5f54a3ca8194167523c6753bfeb96a445279294b6125b68cce2177054';

    assert.strictEqual(interfaceHash, interfaceHash_correct);
    assert.strictEqual(interfaceHash_implementer, erc777Token.address);
  });

  it('...default operator should mint tokens.', async () => {
    const operator_balance_before = await erc777Token.balanceOf.call(defaultOperator);

    const amount = 100;
    await erc777Token.mint(defaultOperator, amount);

    const operator_balance_after = await erc777Token.balanceOf.call(defaultOperator);

    assert.equal(
      operator_balance_before,
      operator_balance_after - amount,
      'Receiver balance was not correctly updated.'
    );
  });

  it('...non default operator should not mint tokens.', async () => {
    const amount = 100;

    try {
      await erc777Token.mint(receiver, amount, { from: holder });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'Mint from non default operator did not revert.'
    );
  });

  it('...holder should send tokens.', async () => {
    const amount = 100
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    const   holder_balance_before = await erc777Token.balanceOf.call(holder);
    const receiver_balance_before = await erc777Token.balanceOf.call(receiver);

    await erc777Token.send(receiver, amount, { from: holder });

    const   holder_balance_after = await erc777Token.balanceOf.call(holder);
    const receiver_balance_after = await erc777Token.balanceOf.call(receiver);

    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
    assert.equal(
      receiver_balance_before.toString(),
      receiver_balance_after - amount,
      'Receiver balance was not correctly updated.'
    );
  });

  it('...holder should not send tokens to ZERO_ADDRESS.', async () => {
    const amount = 100
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.send(zeroAddress, amount, { from: holder });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'Send to ZERO_ADDRESS did not revert.'
    )
  });

  it('...holder should authorizeOperator.', async () => {
    const newOperator = accounts[2];

    const operator_status_before = await erc777Token.isOperatorFor.call(newOperator, holder);

    await erc777Token.authorizeOperator(newOperator, { from: holder });

    const operator_status_after = await erc777Token.isOperatorFor.call(newOperator, holder);

    assert.isNotOk(
      operator_status_before,
      'Operators for holder are not correctly filtered.'
    );
    assert.isOk(
      operator_status_after,
      'Holder did not correctly authorize operator.'
    );
  });

  it('...holder should revokeOperator.', async () => {
    await erc777Token.authorizeOperator(operator, { from: holder });
    const operator_status_before = await erc777Token.isOperatorFor.call(operator, holder);

    await erc777Token.revokeOperator(operator, { from: holder });

    const operator_status_after = await erc777Token.isOperatorFor.call(operator, holder);

    assert.isOk(
      operator_status_before,
      'Operators for holder were not correctly filtered.'
    );
    assert.isNotOk(
      operator_status_after,
      'Operator rights were not orrectly revoked.'
    );
  });

  it('...holder should do operatorSend.', async () => {
    // "holder should be operator for self"
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    const   holder_balance_before = await erc777Token.balanceOf.call(holder);
    const receiver_balance_before = await erc777Token.balanceOf.call(receiver);

    await erc777Token.operatorSend(holder, receiver, amount, { from: holder });

    const   holder_balance_after = await erc777Token.balanceOf.call(holder);
    const receiver_balance_after = await erc777Token.balanceOf.call(receiver);

    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
    assert.equal(
      receiver_balance_before.toString(),
      receiver_balance_after - amount,
      'Receiver balance was not correctly updated.'
    );
  });

  it('...defaultOperator should do operatorSend.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    const   holder_balance_before = await erc777Token.balanceOf.call(holder);
    const receiver_balance_before = await erc777Token.balanceOf.call(receiver);

    await erc777Token.operatorSend(holder, receiver, amount, { from: defaultOperator });

    const   holder_balance_after = await erc777Token.balanceOf.call(holder);
    const receiver_balance_after = await erc777Token.balanceOf.call(receiver);

    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
    assert.equal(
      receiver_balance_before.toString(),
      receiver_balance_after - amount,
      'Receiver balance was not correctly updated.'
    );
  });

  it('...approved operator should do operatorSend.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });
    await erc777Token.authorizeOperator(operator, { from: holder });

    const   holder_balance_before = await erc777Token.balanceOf.call(holder);
    const receiver_balance_before = await erc777Token.balanceOf.call(receiver);

    await erc777Token.operatorSend(holder, receiver, amount, { from: operator });

    const   holder_balance_after = await erc777Token.balanceOf.call(holder);
    const receiver_balance_after = await erc777Token.balanceOf.call(receiver);

    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
    assert.equal(
      receiver_balance_before.toString(),
      receiver_balance_after - amount,
      'Receiver balance was not correctly updated.'
    );
  });

  it('...holder should not operatorSend tokens to ZERO_ADDRESS.', async () => {
    const amount = 100
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.operatorSend(holder, zeroAddress, amount, { from: holder });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend (by holder) to ZERO_ADDRESS did not revert.'
    )
  });

  it('...defaultOperator should not operatorSend tokens to ZERO_ADDRESS.', async () => {
    const amount = 100
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.operatorSend(holder, zeroAddress, amount, { from: defaultOperator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend (by defaultOperator) to ZERO_ADDRESS did not revert.'
    )
  });

  it('...approved operator should not operatorSend tokens to ZERO_ADDRESS.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });
    await erc777Token.authorizeOperator(operator, { from: holder });

    try {
      await erc777Token.operatorSend(holder, zeroAddress, amount, { from: operator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend (by approved operator) to ZERO_ADDRESS did not revert.'
    )
  });

  it('...non operator should not do operatorSend.', async () => {
    const receiver2 = accounts[4];

    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.operatorSend(holder, receiver2, amount, { from: receiver });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend from non operator did not revert.'
    );
  });

  it('...holder should do burn.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    const holder_balance_before = await erc777Token.balanceOf.call(holder);
    const totalSupply_before = await erc777Token.totalSupply.call();

    await erc777Token.burn(amount, { from: holder });

    const holder_balance_after = await erc777Token.balanceOf.call(holder);
    const totalSupply_after = await erc777Token.totalSupply.call();

    assert.equal(
      totalSupply_before - amount,
      totalSupply_after.toString(),
      'TotalSupply was not correcty updated.'
    );
    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
  });

  it('...defaultOperator should do operatorBurn.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });
    await erc777Token.authorizeOperator(operator, { from: holder })

    const holder_balance_before = await erc777Token.balanceOf.call(holder);
    const totalSupply_before = await erc777Token.totalSupply.call();

    await erc777Token.operatorBurn(holder, amount, { from: defaultOperator });

    const holder_balance_after = await erc777Token.balanceOf.call(holder);
    const totalSupply_after = await erc777Token.totalSupply.call();

    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
    assert.equal(
      totalSupply_before - amount,
      totalSupply_after.toString(),
      'TotalSupply was not correcty updated.'
    );
  });

  it('...approved operator should do operatorBurn.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });
    await erc777Token.authorizeOperator(operator, { from: holder })

    const holder_balance_before = await erc777Token.balanceOf.call(holder);
    const totalSupply_before = await erc777Token.totalSupply.call();

    await erc777Token.operatorBurn(holder, amount, { from: operator });

    const holder_balance_after = await erc777Token.balanceOf.call(holder);
    const totalSupply_after = await erc777Token.totalSupply.call();

    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
    assert.equal(
      totalSupply_before - amount,
      totalSupply_after.toString(),
      'TotalSupply was not correcty updated.'
    );
  });

  it('...holder should do operatorBurn.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });
    await erc777Token.authorizeOperator(operator, { from: holder })

    const holder_balance_before = await erc777Token.balanceOf.call(holder);
    const totalSupply_before = await erc777Token.totalSupply.call();

    await erc777Token.operatorBurn(holder, amount, { from: holder });

    const holder_balance_after = await erc777Token.balanceOf.call(holder);
    const totalSupply_after = await erc777Token.totalSupply.call();

    assert.equal(
      holder_balance_before - amount,
      holder_balance_after.toString(),
      'Holder balance was not correctly updated.'
    );
    assert.equal(
      totalSupply_before - amount,
      totalSupply_after.toString(),
      'TotalSupply was not correcty updated.'
    );
  });

  it('...non operator should not do operatorBurn.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.operatorBurn(holder, amount, { from: holder });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorBurn from non operator did not revert.'
    )
  });

  it('...should not accept ETH.', async () => {
    const amount = 100;
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    const accBalance = await web3.eth.getBalance(holder);
    const oneEth = await web3.utils.toWei('1', 'ether');

    try {
      await web3.eth.sendTransaction({ from: holder, to: erc777Token.address, value: oneEth });
    } catch (e) {
      revert = e;
    }

    assert.isOk(
      accBalance >= oneEth,
      'Account was not funded well enough.'
    );
    assert.instanceOf(
      revert,
      Error,
      'Ether send to contract did not revert.'
    );
  });

  it('...defaultOperator should not mint with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101

    try {
      await erc777Token.mint(holder, wrongAmount, { from: defaultOperator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'Mint with wrong granularity did not revert.'
    );
  });

  it('...holder should not send with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.send(receiver, wrongAmount, { from: holder });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'Send with wrong granularity did not revert.'
    );
  });

  it('...holder should not operatorSend with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.operatorSend(holder, receiver, wrongAmount, { from: holder });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend (by holder) with wrong granularity did not revert.'
    );
  });

  it('...approved operator should not operatorSend with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101
    await erc777Token.mint(holder, amount, { from: defaultOperator });
    await erc777Token.authorizeOperator(operator, { from: holder })

    try {
      await erc777Token.operatorSend(holder, receiver, wrongAmount, { from: operator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend (by approved operator) with wrong granularity did not revert.'
    );
  });

  it('...defaultOperator should not operatorSend with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.operatorSend(holder, receiver, wrongAmount, { from: defaultOperator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend (by defaultOperator) with wrong granularity did not revert.'
    );
  });

  it('...holder should not burn with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.burn(wrongAmount, { from: holder });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorSend (by holder) with wrong granularity did not revert.'
    );
  });

  it('...approved operator should not operatorBurn with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101
    await erc777Token.mint(holder, amount, { from: defaultOperator });
    await erc777Token.authorizeOperator(operator, { from: holder })

    try {
      await erc777Token.operatorBurn(holder, wrongAmount, { from: operator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorBurn (by approved operator) with wrong granularity did not revert.'
    );
  });

  it('...defaultOperator should not burn with wrong granularity.', async () => {
    const amount = 200
    const wrongAmount = 101
    await erc777Token.mint(holder, amount, { from: defaultOperator });

    try {
      await erc777Token.operatorBurn(holder, wrongAmount, { from: defaultOperator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'OperatorBurn (by approved operator) with wrong granularity did not revert.'
    );
  });

  /*
    TODO: Test hooks
          - should call hooks on:
              - holder send
              - operator send
              - mint
              - burn
              - operatorBurn
  */

  /*
  it('...should call `tokensToSend` hook.', async () => {

  });

  it('...should call `tokensReceived` hook.', async () => {

  });

  it('...should not deploy with granularity of 0.', async () => {

  });
  */

  // TODO: Test event logging
  // TODO: Test send/operatorSend/mint/burn with negative values
  // TODO: Test send/operatorSend/mint/burn with zero values
  // TODO: Test send/operatorSend/mint/burn with using default parameters
});
