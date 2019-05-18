/*
  NOTE:
        myMethod.call - Will call a “constant” method, can not alter the smart contract state.

*/
const erc721 = artifacts.require("erc721");

contract("ERC721", async accounts => {
  it("...should set erc165 interface.", async () => {
    const erc721Token = await erc721.deployed();

    const ERC165_INTERFACE_ID = '0x0000000000000000000000000000000000000000000000000000000001ffc9a7';
    const has_erc165_interface = await erc721Token.supportsInterface.call(ERC165_INTERFACE_ID);
    assert.ok(has_erc165_interface, "The erc165 interface was not correctly set.");
  });

  it("...should set erc721 interface.", async () => {
    const erc721Token = await erc721.deployed();

    const ERC721_INTERFACE_ID = '0x0000000000000000000000000000000000000000000000000000000080ac58cd';
    const has_erc721_interface = await erc721Token.supportsInterface.call(ERC721_INTERFACE_ID);
    assert.ok(has_erc721_interface, "The erc721 interface was not correctly set.");
  });

  it("...should mint token to owner.", async () => {
    const owner = accounts[0];
    const erc721Token = await erc721.deployed();

    let balance = await erc721Token.balanceOf.call(owner);
    const minter_starting_balance = balance.toString();

    // TODO: weird -> we are getting the token id from the mint event parameters
    //       how to get the return value of mint()??
    let returnData = await erc721Token.mint();
    const tokenId_1 = returnData.logs[0].args['1'].toString();
    returnData = await erc721Token.mint();
    const tokenId_2 = returnData.logs[0].args['1'].toString();

    const ownerOfToken_1 = await erc721Token.ownerOf.call(tokenId_1);
    const ownerOfToken_2 = await erc721Token.ownerOf.call(tokenId_2);

    balance = await erc721Token.balanceOf.call(owner);
    const minter_ending_balance = balance.toString();

    assert.equal(
      tokenId_1,
      0,
      "Token ID wasn't correctly set."
    );
    assert.equal(
      tokenId_2,
      1,
      "Token ID wasn't correctly set."
    );
    assert.equal(
      minter_starting_balance,
      minter_ending_balance - 2,
      "Token wasn't correctly minted to owner."
    );
    assert.equal(
      ownerOfToken_1,
      owner,
      "Owner of first minted token wasn't correctly set."
    );
    assert.equal(
      ownerOfToken_2,
      owner,
      "Owner of second minted token wasn't correctly set."
    );
  });

  // TODO:
  it("...mint should revert if msg.sender is not owner.", async () => {

  });

  it("...should safeTransferFrom.", async () => {
    const owner = accounts[0];
    const recceiver = accounts[1];
    const erc721Token = await erc721.deployed();

    // TODO: weird -> we are getting the token id from the mint event parameters
    //       how to get the return value of mint()??
    let returnData = await erc721Token.mint();
    const tokenId = returnData.logs[0].args['1'].toString();

    const ownerBalanceBefore = await erc721Token.balanceOf.call(owner);
    const receiverBalanceBefore = await erc721Token.balanceOf.call(recceiver);
    const ownerOfTokenBefore = await erc721Token.ownerOf.call(tokenId);

    await erc721Token.safeTransferFrom(owner, recceiver, tokenId);

    const ownerBalanceAfter = await erc721Token.balanceOf.call(owner);
    const receiverBalanceAfter = await erc721Token.balanceOf.call(recceiver);
    const ownerOfTokenAfter = await erc721Token.ownerOf.call(tokenId);

    assert.equal(
      ownerBalanceBefore - 1,
      ownerBalanceAfter.toString(),
      "Balance of owner wasn't correctly updated."
    );

    assert.equal(
      receiverBalanceBefore.toString(),
      receiverBalanceAfter - 1,
      "Balance of reveiver wasn't correctly updated."
    );

    assert.equal(
      ownerOfTokenAfter,
      recceiver,
      "Owner of token wasn't correctly updated."
    );
  });

  it("...should transferFrom.", async () => {
    const owner = accounts[0];
    const recceiver = accounts[1];
    const erc721Token = await erc721.deployed();

    // TODO: weird -> we are getting the token id from the mint event parameters
    //       how to get the return value of mint()??
    let returnData = await erc721Token.mint();
    const tokenId = returnData.logs[0].args['1'].toString();

    const ownerBalanceBefore = await erc721Token.balanceOf.call(owner);
    const receiverBalanceBefore = await erc721Token.balanceOf.call(recceiver);
    const ownerOfTokenBefore = await erc721Token.ownerOf.call(tokenId);

    await erc721Token.transferFrom(owner, recceiver, tokenId);

    const ownerBalanceAfter = await erc721Token.balanceOf.call(owner);
    const receiverBalanceAfter = await erc721Token.balanceOf.call(recceiver);
    const ownerOfTokenAfter = await erc721Token.ownerOf.call(tokenId);

    assert.equal(
      ownerBalanceBefore - 1,
      ownerBalanceAfter.toString(),
      "Balance of owner wasn't correctly updated."
    );

    assert.equal(
      receiverBalanceBefore.toString(),
      receiverBalanceAfter - 1,
      "Balance of reveiver wasn't correctly updated."
    );

    assert.equal(
      ownerOfTokenAfter,
      recceiver,
      "Owner of token wasn't correctly updated."
    );
  });

  // TODO:
  it("...safeTransferFrom to contract without onERC721Received should revert.", async () => {

  });

  it("...safeTransferFrom to ZERO_ADDRESS should revert.", async () => {
    const owner = accounts[0];
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const erc721Token = await erc721.deployed();

    let returnData = await erc721Token.mint();
    const tokenId = returnData.logs[0].args['1'].toString();

    let revert = false;
    try {
      const result = await erc721Token.safeTransferFrom(owner, ZERO_ADDRESS, tokenId);
    } catch (e) {
      revert = e;
    }
    assert.instanceOf(
      revert,
      Error,
      "SafeTransferFrom to ZERO_ADDRESS did not revert."
    )
  });

  it("...transferFrom to ZERO_ADDRESS should revert.", async () => {
    const owner = accounts[0];
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const erc721Token = await erc721.deployed();

    let returnData = await erc721Token.mint();
    const tokenId = returnData.logs[0].args['1'].toString();

    let revert = false;
    try {
      const result = await erc721Token.transferFrom(owner, ZERO_ADDRESS, tokenId);
    } catch (e) {
      revert = e;
    }
    assert.instanceOf(
      revert,
      Error,
      "TransferFrom to ZERO_ADDRESS did not revert."
    )
  });

  it("...safeTransferFrom should revert if 'tokenId' is not a valid NFT.", async () => {

  });

  it("...transferFrom should revert if 'tokenId' is not a valid NFT.", async () => {

  });

  it("...safeTransferFrom should revert if 'from' is not the owner.", async () => {

  });

  it("...transferFrom should revert if 'from' is not the owner.", async () => {

  });

  it("...balanceOf should revert for queries about the zero address.", async () => {

  });

  it("...ownerOf should revert for queries about the zero address.", async () => {

  });

  it("...should approve if is owner.", async () => {
    /*
    const owner = accounts[0];
    const operator = accounts[1];

    const erc721Token = await erc721.deployed();
    let returnData = await erc721Token.mint();
    const tokenId = returnData.logs[0].args['1'].toString();

    await erc721Token.approve(operator, tokenId, { from: owner });
    */
  });

  it("...approve should revert if 'tokenId' is not owned by 'msg.sender'.", async () => {

  });

  it("...approve should revert if 'tokenId' is not a valid NFT.", async () => {

  });

  it("...should approve if is an authorized operator.", async () => {

  });

  it("...approve should revert if 'msg.sender' is not an authorized operator.", async () => {

  });

  it("...should setApprovalForAll.", async () => {

  });

  it("...should getApproved.", async () => {

  });

  it("...getApproved should revert if 'tokenId' is not a valid NFT.", async () => {

  });

  it("...isApprovedForAll should return 'True' if address is approvedForAll.", async () => {

  });

  it("...isApprovedForAll should return 'False' if address is not approvedForAll.", async () => {

  });

});
