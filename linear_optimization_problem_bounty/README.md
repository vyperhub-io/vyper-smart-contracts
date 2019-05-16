# Linear optimization problem bounty

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

### How it works

Users can submit solutions using the `submitSolution(_x1: uint256, _x2: uint256)` method.
The contract checks the submitted values against the problems constraints and saves/rejects them depending on whether the solution respects all of them.
When the end of the competition is reached, the address that submitted the best solution can call `claimBounty()` to claim the Ether that is locked in the contract.
