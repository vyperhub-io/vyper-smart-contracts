const erc721 = artifacts.require("erc721");

let owner,
    receiver,
    operator,
    erc721Token;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ERC165_INTERFACE_ID = '0x0000000000000000000000000000000000000000000000000000000001ffc9a7';
const ERC721_INTERFACE_ID = '0x0000000000000000000000000000000000000000000000000000000080ac58cd';

contract("ERC721", async accounts => {
  beforeEach(async () => {
    owner = accounts[0];
    receiver = accounts[1];
    operator = accounts[2];
    erc721Token = await erc721.new({ from: owner });
  });

  it("...should register ERC165 interface.", async () => {
    const has_erc165_interface = await erc721Token.supportsInterface.call(ERC165_INTERFACE_ID);
    assert.ok(has_erc165_interface, "The ERC165 interface was not correctly registered.");
  });

  it("...should register ERC721 interface.", async () => {
    const has_erc721_interface = await erc721Token.supportsInterface.call(ERC721_INTERFACE_ID);
    assert.ok(has_erc721_interface, "The ERC721 interface was not correctly registered.");
  });

  it("...should mint token to owner.", async () => {
    let balance = await erc721Token.balanceOf.call(owner);
    const minter_starting_balance = balance.toString();

    // TODO: weird -> we are getting the token id from the mint event parameters
    //       how to get the return value of mint()??
    let returnData = await erc721Token.mint({ from: owner });
    const tokenId_1 = returnData.logs[0].args['1'].toString();
    returnData = await erc721Token.mint({ from: owner });
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
    try {
      await erc721Token.mint({ from: receiver });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      'Mint by non owner did not revert.'
    )
  });

  it("...should safeTransferFrom.", async () => {
    // TODO: weird -> we are getting the token id from the mint event parameters
    //       how to get the return value of mint()??
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    const ownerBalanceBefore = await erc721Token.balanceOf.call(owner);
    const receiverBalanceBefore = await erc721Token.balanceOf.call(receiver);
    const ownerOfTokenBefore = await erc721Token.ownerOf.call(tokenId);

    await erc721Token.safeTransferFrom(owner, receiver, tokenId);

    const ownerBalanceAfter = await erc721Token.balanceOf.call(owner);
    const receiverBalanceAfter = await erc721Token.balanceOf.call(receiver);
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
      receiver,
      "Owner of token wasn't correctly updated."
    );
  });

  it("...should transferFrom.", async () => {
    // TODO: weird -> we are getting the token id from the mint event parameters
    //       how to get the return value of mint()??
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    const ownerBalanceBefore = await erc721Token.balanceOf.call(owner);
    const receiverBalanceBefore = await erc721Token.balanceOf.call(receiver);
    const ownerOfTokenBefore = await erc721Token.ownerOf.call(tokenId);

    await erc721Token.transferFrom(owner, receiver, tokenId);

    const ownerBalanceAfter = await erc721Token.balanceOf.call(owner);
    const receiverBalanceAfter = await erc721Token.balanceOf.call(receiver);
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
      receiver,
      "Owner of token wasn't correctly updated."
    );
  });

  // TODO:
  it("...safeTransferFrom() to contract without onERC721Received should revert.", async () => {

  });

  it("...safeTransferFrom() to ZERO_ADDRESS should revert.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
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

  it("...transferFrom() to ZERO_ADDRESS should revert.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
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

  it("...safeTransferFrom() should revert if 'tokenId' is not a valid NFT.", async () => {
    const tokenId = -1

    let revert = false;
    try {
      await erc721Token.safeTransferFrom(owner, receiver, tokenId);
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "SafeTransferFrom of non valid NFT did not revert."
    )
  });

  it("...transferFrom() should revert if 'tokenId' is not a valid NFT.", async () => {
    const tokenId = -1

    let revert = false;
    try {
      await erc721Token.transferFrom(owner, receiver, tokenId);
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "TransferFrom of non valid NFT did not revert."
    )
  });

  it("...safeTransferFrom() should revert if 'from' is not the owner.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    let revert = false;
    try {
      await erc721Token.safeTransferFrom(receiver, owner, tokenId);
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "SafeTransferFrom by non owner did not revert."
    )
  });

  it("...transferFrom() should revert if 'from' is not the owner.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    let revert = false;
    try {
      await erc721Token.transferFrom(receiver, owner, tokenId);
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "SafeTransferFrom by non owner did not revert."
    )
  });

  it("...balanceOf() should revert for queries about the ZERO_ADDRESS.", async () => {
    let revert = false;
    try {
      await erc721Token.balanceOf(ZERO_ADDRESS);
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "BalanceOf query about ZERO_ADDRESS did not revert."
    )
  });

  it("...should approve() if is owner.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    let revert = false;
    try {
      await erc721Token.approve(operator, tokenId, { from: owner });
    } catch (e) {
      revert = e;
    }

    const isApproved = await erc721Token.getApproved.call(tokenId);

    assert.isOk(
      isApproved,
      "Operator was not correctly approved."
    );
    assert.isNotOk(
      revert,
      "Operator was not correctly approved."
    );
  });

  it("...approve() should revert if 'tokenId' is not owned by 'msg.sender'.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    let revert = false;
    try {
      await erc721Token.approve(owner, tokenId, { from: operator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "Approve from non owner did not revert."
    )
  });

  it("...approve() should revert if 'tokenId' is not a valid NFT.", async () => {
    let revert = false;
    try {
      await erc721Token.approve(owner, -1, { from: operator });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "Approve of non valid NFT did not revert."
    )
  });

  it("...should approve if is an authorized operator.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    await erc721Token.approve(operator, tokenId, { from: owner });

    await erc721Token.approve(accounts[3], tokenId, { from: operator });

    const isApproved = await erc721Token.getApproved.call(tokenId);

    assert.equal(
      isApproved,
      accounts[3],
      "Authorized operator did not correctly approve."
    );
  });

  it("...approve should revert if 'msg.sender' is not an authorized operator.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    let revert = false;
    try {
      await erc721Token.approve(owner, tokenId, { from: account[3] });
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "Approve call from non authorized operator did not revert."
    )
  });

  it("...should getApproved.", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    await erc721Token.approve(operator, tokenId, { from: owner });

    const isApproved = await erc721Token.getApproved.call(tokenId);

    assert.equal(
      isApproved,
      operator,
      "Did not correctly getApproved."
    );
  });

  it("...should setApprovalForAll.", async () => {
    await erc721Token.setApprovalForAll(operator, true, { from: owner });

    const isApprovedForAll = await erc721Token.isApprovedForAll.call(owner, operator);

    assert.isOk(
      isApprovedForAll,
      "Did not setApprovalForAll."
    );
  });

  it("...isApprovedForAll should return 'False' if address is not approvedForAll.", async () => {
    const isApprovedForAll = await erc721Token.isApprovedForAll.call(owner, accounts[3]);

    assert.isNotOk(
      isApprovedForAll,
      "Did not return 'False' for address that is not approvedForAll."
    );
  });

  it("...getApproved should revert if 'tokenId' is not a valid NFT.", async () => {
    let revert = false;
    try {
      await erc721Token.getApproved.call(-1);
    } catch (e) {
      revert = e;
    }

    assert.instanceOf(
      revert,
      Error,
      "GetApproved of non valid NFT did not revert."
    )
  });

  // Test event logging
  it("...should log 'Minted' on mint().", async () => {
    const res = await erc721Token.mint({ from: owner });
    const log = res.logs.find(element => element.event.match('Mint'));

    assert.strictEqual(log.args._to, owner);
    assert.strictEqual(log.args._tokenId.toString(), "0");
  })

  it("...should log 'Transfer' on safeTransferFrom().", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    const res = await erc721Token.safeTransferFrom(owner, receiver, tokenId);
    const log = res.logs.find(element => element.event.match('Transfer'));

    assert.strictEqual(log.args._from, owner);
    assert.strictEqual(log.args._to, receiver);
    assert.strictEqual(log.args._tokenId.toString(), tokenId);
  })

  it("...should log 'Transfer' on transferFrom().", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    const res = await erc721Token.transferFrom(owner, receiver, tokenId);
    const log = res.logs.find(element => element.event.match('Transfer'));

    assert.strictEqual(log.args._from, owner);
    assert.strictEqual(log.args._to, receiver);
    assert.strictEqual(log.args._tokenId.toString(), tokenId);
  })

  it("...should log 'Approval' on approve().", async () => {
    const returnData = await erc721Token.mint({ from: owner });
    const tokenId = returnData.logs[0].args['1'].toString();

    const res = await erc721Token.approve(operator, tokenId, { from: owner });
    const log = res.logs.find(element => element.event.match('Approval'));

    assert.strictEqual(log.args._owner, owner);
    assert.strictEqual(log.args._approved, operator);
    assert.strictEqual(log.args._tokenId.toString(), tokenId);
  })

  it("...should log 'ApprovalForAll' on setApprovalForAll().", async () => {
    const res = await erc721Token.setApprovalForAll(operator, true, { from: owner });
    const log = res.logs.find(element => element.event.match('ApprovalForAll'));

    assert.strictEqual(log.args._owner, owner);
    assert.strictEqual(log.args._operator, operator);
    assert.strictEqual(log.args._approved, true);
  })
});
