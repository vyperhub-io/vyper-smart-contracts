# ERC721

This contract implements a bounty for solving linear optimization problems.
An example problem is defined in the contracts `_calculateNewSolution(_x1: uint256, _x2: uint256)` method:

```python
  assert _x1 <= 8
  assert _x2 <= 12
  assert (3 * _x1) + (2 * _x2) <= 100
  assert _x1 + _x2 <= 24
  assert _x1 > 0 and _x2 > 0
  # calculate and return new solution
  return (3 * _x1) + (2 * _x2)
```

```text
1) Ahh Ethereum related work - what a bliss! But on any given day, after a maximum of 8 hours, the FOMO just gets to real. You need to skratch that itch and check out those totally healthy/objective/productive/non toxic Twitter discussions.

2) Voicing your opinion on whether Ether is money or if that blockchain with less than 500 monthly transactions is sufficiently decentralized is great! But you only need to skratch that itch for 12 hours each day - or less.

3) Work life balance - lol! You are litteraly building the future here! Shame you only get 24 hours each day! And you're going to use all of them. Hey, maybe blockchain with just the right amount of basic game theory could help solve that problem!

4) Einstein said that going back in time is not possible. Lol guy prob didn't own a Delorean. But once that totally undervalued coin you FOMO'ed into last year gets the attention it deserves you will.

5) Prediction markets show that working on Ethereum related stuff gives you +3 of whatever it is you need but Twitter discussions only +2. 100 of that stuff is enough though.

x1 = hours working on Ethereum related stuff
x2 = hours engaging in the latest blockchain Twitter discussions
```

Users can submit solutions using the `submitSolution(_x1: uint256, _x2: uint256)` method.
The contract checks the submitted values against the problems constraints and saves/rejects them depending on whether the solution respects all of them.
When the end of the competition is reached, the address that submitted the best solution can call `claimBounty()` to claim the Ether that is locked in the contract.
