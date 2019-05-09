/*
  NOTE:
        myMethod.call - Will call a “constant” method, can not alter the smart contract state.

*/
const erc721 = artifacts.require("erc721");

contract("ERC721", async accounts => {
  it(`...should set erc165 interface.`, async () => {
    const erc721Token = await erc721.deployed();
    // get token name
    const ERC165_INTERFACE_ID = '0x0000000000000000000000000000000000000000000000000000000001ffc9a7';
    const has_erc165_interface = await erc721Token.supportsInterface.call(ERC165_INTERFACE_ID);
    assert.ok(has_erc165_interface, "The erc165 interface was not correctly set.");
  });

  it(`...should set erc721 interface.`, async () => {
    const erc721Token = await erc721.deployed();
    // get token name
    const ERC721_INTERFACE_ID = '0x0000000000000000000000000000000000000000000000000000000080ac58cd';
    const has_erc721_interface = await erc721Token.supportsInterface.call(ERC721_INTERFACE_ID);
    assert.ok(has_erc721_interface, "The erc721 interface was not correctly set.");
  });

  it(`...should mint token to owner.`, async () => {
    const owner = accounts[0];
    const erc721Token = await erc721.deployed();

    let balance = await erc721Token.balanceOf.call(owner);
    const minter_starting_balance = balance.toString();

    // TODO: test if allocating token id's is working
    //let tokenIdOne = await erc721Token.mint();
    //let tokenIdTwo = await erc721Token.mint();
    //const ownerOfTokenOne = await erc721Token.ownerOf.call(tokenIdOne);
    //const ownerOfTokenTwo = await erc721Token.ownerOf(tokenIdTwo);

    await erc721Token.mint();

    balance = await erc721Token.balanceOf.call(owner);
    const minter_ending_balance = balance.toString();

    assert.equal(
      minter_starting_balance,
      minter_ending_balance - 1,
      "Token wasn't correctly minted to owner."
    );
    /* TODO:
    assert.equal(
      ownerOfTokenOne,
      owner,
      "Owner of first minted token wasn't correctly set."
    );
    assert.equal(
      ownerOfTokenTwo,
      owner,
      "Owner of second minted token wasn't correctly set."
    );
    */
  });

  // TODO: how to get return value of mint() ?
  /*
  it("...should transfer tokens using 'safeTransferFrom'.", async () => {
    const owner = accounts[0];
    const recipient = accounts[1];

    const erc721Token = await erc721.deployed();

    // mint a token to owner
    let tokenId = await erc721Token.mint.call({ from: owner });
    tokenId = tokenId.toString()
    console.log({tokenId})

    let balance = await erc721Token.balanceOf.call(owner);
    const owner_starting_balance = balance.toString();
    console.log({ owner_starting_balance })

    balance = await erc721Token.balanceOf.call(recipient);
    const recipient_starting_balance = balance.toString();

    // 'owner/operator' transfers tokens of 'owner' to himself
    await erc721Token.transferFrom(owner, recipient, tokenId, { from: owner });

    balance = await erc721Token.balanceOf.call(owner);
    const owner_ending_balance = balance.toString();

    balance = await erc721Token.balanceOf.call(recipient);
    const recipient_ending_balance = balance.toString();


    assert.equal(
      owner_starting_balance - amount,
      owner_ending_balance,
      "Amount wasn't correctly transfered from the owner"
    );
    assert.equal(
      recipient_starting_balance,
      recipient_ending_balance - amount,
      "Amount wasn't correctly transfered to the recipient"
    );
  });
  */

});
