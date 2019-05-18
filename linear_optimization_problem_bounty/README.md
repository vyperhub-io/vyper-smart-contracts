# Linear optimization problem bounty

This contract implements a bounty for solving linear optimization problems.
An example problem is defined in the contracts `_calculateNewSolution(_x1: uint256, _x2: uint256)` method:

```python
  assert x1 <= 40
  assert x2 <= 35
  assert (3 * x1) + (2 * x2) <= 200
  assert x1 + x2 <= 120
  assert x1 > 0 and x2 > 0
  # calculate and return new solution
  return (4 * x1) + (6 * x2)
```

### How it works

Users can submit solutions using the `submitSolution(_x1: uint256, _x2: uint256)` method.
The contract checks the submitted values against the problems constraints and saves/rejects them depending on whether the solution respects all of them.
When the end of the competition is reached, the address that submitted the best solution can call `claimBounty()` to claim the Ether that is locked in the contract.

## Run tests
```bash
$ truffle test --network ganache
```
