const LOPB = artifacts.require("linear_optimization_problem_bounty");

const args = {
  durationInBlocks: 10,
}

contract("linear_optimization_problem_bounty", async accounts => {
  it("...should set correct initial paramters.", async () => {
    const instance = await LOPB.deployed({ ...args });
    const owner = await instance.owner();
    const bestSolution = await instance.bestSolution();
    const durationInBlocks = await instance.durationInBlocks();
    const competitionEnd = await instance.competitionEnd();
    const addressOfWinner = await instance.addressOfWinner();
    const claimPeriodeLength = await instance.claimPeriodeLength();

    const minedBlockNumber = await web3.eth.getBlockNumber();

    assert.equal(
      owner,
      accounts[0],
      "Owner wasn't correctly set."
    );
    assert.equal(
      bestSolution,
      0,
      "BestSolution wasn't initialized with 0."
    );
    assert.equal(
      durationInBlocks,
      args.durationInBlocks,
      "DurationInBlocks wasn't correctly set."
    );
    assert.equal(
      competitionEnd,
      minedBlockNumber + durationInBlocks,
      "DurationInBlocks wasn't correctly set."
    );
    assert.equal(
      addressOfWinner,
      '0x0000000000000000000000000000000000000000',
      "AddressOfWinner wasn't correctly initialized with ZERO_ADDRESS."
    );
    assert.equal(
      claimPeriodeLength,
      args.durationInBlocks,
      "ClaimPeriodeLength wasn't correctly set."
    );
  });

  it("...should set correct values when submitting new valid solution.", async () => {
    const instance = await LOPB.deployed({ ...args });
    const x1 = 1;
    const x2 = 1;
    await instance.submitSolution.call(x1, x2);

    const instance_x1 = await instance.x1();
    const instance_x2 = await instance.x2();
    const instance_bestSolution = await instance.bestSolution();
    const instance_addressOfWinner = await instance.addressOfWinner();

    assert.equal(
      instance_x1,
      x1,
      "x1 value wasn't correctly set."
    );
    assert.equal(
      instance_x2,
      x2,
      "x2 value wasn't correctly set."
    );
    // NOTE: update this if the problem in the contract is changed
    assert.equal(
      instance_bestSolution,
      (4 * x1) + (6 * x2),
      "BestSolution value wasn't correctly set."
    );
    assert.equal(
      instance_addressOfWinner,
      accounts[0],
      "AddressOfWinner wasn't correctly set."
    );
  });

  it("...should increase bounty.", async () => {
    const instance = await LOPB.deployed({ ...args });
    const contractBalance_BeforeTopUp = web3.eth.getBalance(instance);
    const transactionValue_inEth = 1;
    const transactionValue_inWei = web3.utils.toWei(transactionValue_inEth);
    // top up bounty
    await instance.topUpBounty.call({}, { from: account[0], value: transactionValue_inWei });

    const contractBalance_AfterTopUp = web3.eth.getBalance(instance);
    assert.equal(
      contractBalance_BeforeTopUp,
      contractBalance_AfterTopUp - transactionValue_inWei,
      "Bounty was not correctly increased."
    );
  });

  // TODO: this is not complete
  // TODO: Hmmm, need to create 'claimPeriodeLength = 6172' blocks
  //       so that block.number > (self.competitionEnd + self.claimPeriodeLength)
  //       not sure how to test this...
  it("...should claim bounty.", async () => {
    const instance = await LOPB.deployed({ ...args });

    const contractBalance_Before = web3.eth.getBalance(instance);
    const competitionEnd_Before = await instance.competitionEnd();
    const x1 = 1;
    const x2 = 1;
    const transactionValue_inEth = 1;
    const transactionValue_inWei = web3.utils.toWei(transactionValue_inEth);
    // top up bounty
    await instance.topUpBounty.call({}, { from: account[0], value: transactionValue_inWei });
    const contractBalance_After = web3.eth.getBalance(instance);
    await instance.claimBounty();

    const competitionEnd_After = await instance.competitionEnd();

  });

  // TODO:
  it("...should extend competition.", async () => {
    const instance = await LOPB.deployed({ durationInBlocks: 1 });
    const durationInBlocks = await instance.durationInBlocks();
    const competitionEnd_Before = await instance.competitionEnd();

    // TODO: Hmmm, need to create 'claimPeriodeLength = 6172' blocks
    //      so that block.number > (self.competitionEnd + self.claimPeriodeLength)
    //      not sure how to test this...

    /*
    // create dummy block

    const result = await web3.eth.sendTransaction({
      from: account[0],
      to: '0x0000000000000000000000000000000000000000',
      value: 1, // in wei
    });
    */
  });
});
