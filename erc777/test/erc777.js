const { assertRevert } = require('./helpers/assertRevert');

const erc777 = artifacts.require('erc777');
const erc1820Registry = artifacts.require('ERC1820Registry');

const truffleFromAddress = '0x954e72fdc51Cf919203067406fB337Ed4bDC8CdA';

const args = {
  name: 'My777Token',
  symbol: 'MT777',
  totalSupply: 100000000,
  granularity: 1,
  defaultOperators: [
    truffleFromAddress,
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
    '0x0000000000000000000000000000000000000003',
  ],
}

let erc777Token, erc1820JsonInterface, erc1820Address, erc1820Instance;

contract('ERC777', async accounts => {
  beforeEach(async () => {
    erc1820JsonInterface = erc1820Registry.abi
    erc1820Address = '0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24'
    erc1820Instance = new web3.eth.Contract(erc1820JsonInterface, erc1820Address)

    erc777Token = await erc777.new(
      args.name,
      args.symbol,
      args.totalSupply,
      args.granularity,
      args.defaultOperators,
      { from: accounts[0] }
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
    const interfaceHash = web3.utils.keccak256('ERC777Token')
    const interfaceHash_implemented = await erc1820Instance.getInterfaceImplementer(erc777Token.address, interfaceHash)

    const interfaceHash_correct = '0xac7fbab5f54a3ca8194167523c6753bfeb96a445279294b6125b68cce2177054'

    assert.strictEqual(interfaceHash_implemented, interfaceHash_correct);
  });

  it('...holder should send Token.', async () => {

  });

  /*
  it('...holder should authorizeOperator.', async () => {

  });

  it('...holder should revokeOperator.', async () => {

  });

  it('...holder should do operatorSend (holder should be operator for self).', async () => {

  });

  it('...defaultOperator should do operatorSend.', async () => {

  });

  it('...approved operator should do operatorSend.', async () => {

  });

  it('...holder should do operatorSend.', async () => {

  });

  it('...should mint.', async () => {

  });

  it('...should burn.', async () => {

  });

  it('...should do operatorBurn.', async () => {

  });

  it('...should call `tokensToSend` hook.', async () => {

  });

  it('...should call `tokensReceived` hook.', async () => {

  });

  // SHOULD NOT

  it('...should not deploy with granularity of 0.', async () => {

  });

  it('...should not accept ETH.', async () => {

  });

  it('...holder should not mint with wrong granularity.', async () => {

  });

  it('...holder should not send with wrong granularity.', async () => {

  });

  it('...holder should not burn with wrong granularity.', async () => {

  });

  it('...operator should not mint with wrong granularity.', async () => {

  });

  it('...operator should not send with wrong granularity.', async () => {

  });

  it('...operator should not burn with wrong granularity.', async () => {

  });

  it('...defaultOperator should not mint with wrong granularity.', async () => {

  });

  it('...defaultOperator should not send with wrong granularity.', async () => {

  });

  it('...defaultOperator should not burn with wrong granularity.', async () => {

  });
  */

  /*
    TODO: Test hooks
    - should call hooks on:
        - holder send
        - operator send
        - mint
        - burn
        - operatorBurn

  */
  // TODO: Test event logging
  // TODO: Test send/operatorSend/mint/burn with negative values
  // TODO: Test send/operatorSend/mint/burn with zero values
  // TODO: Test sending to ZERO_ADDRESS
  // TODO: Test send/operatorSend/mint/burn with using default parameters
});
