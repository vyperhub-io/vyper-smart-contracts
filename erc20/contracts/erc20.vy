# Author: Sören Steiger, github.com/ssteiger
# License: MIT

# ERC20 Token Standard
# https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md


from vyper.interfaces import ERC20

implements: ERC20

# EVENTS:

# ----- Transfer -----
# MUST trigger when tokens are transferred, including zero value transfers.
# A token contract which creates new tokens SHOULD trigger a Transfer event
# with the _from address set to 0x0 when tokens are created.
Transfer: event({_from: indexed(address), _to: indexed(address), _value: uint256})

# ----- Approval -----
# MUST trigger on any successful call to approve(address _spender, uint256 _value).
Approval: event({_owner: indexed(address), _spender: indexed(address), _value: uint256})


# STATE VARIABLES:
# values which are permanently stored in contract storage

# ----- name -----
# Returns the name of the token - e.g. "MyToken".
# OPTIONAL - This method can be used to improve usability, but interfaces and
#            other contracts MUST NOT expect these values to be present.
name: public(string[64]) # TODO: is this an acceptable size?

# ----- symbol -----
# Returns the symbol of the token. E.g. "HIX".
# OPTIONAL - This method can be used to improve usability, but interfaces and
#            other contracts MUST NOT expect these values to be present.
symbol: public(string[32]) # TODO: is this an acceptable size?

# ----- decimals -----
# Returns the number of decimals the token uses - e.g. 8, means to divide
# the token amount by 100000000 to get its user representation.
# OPTIONAL - This method can be used to improve usability, but interfaces and
#            other contracts MUST NOT expect these values to be present.
decimals: public(uint256)

# ----- totalSupply -----
# Returns the total token supply.
totalSupply: public(uint256)

# mappings
balanceOf: public(map(address, uint256))
approvedFunds: map(address, map(address, uint256))


@public
def __init__(_name: string[64], _symbol: string[32], _decimals: uint256, _totalSupply: uint256):
    self.name = _name
    self.symbol = _symbol
    self.decimals = _decimals
    self.totalSupply = _totalSupply * 10 ** _decimals
    # mint all tokens to the contract creator
    self.balanceOf[msg.sender] = self.totalSupply
    # fire transfer event
    log.Transfer(ZERO_ADDRESS, msg.sender, self.totalSupply)


# METHODS:

# NOTES:
# Callers MUST handle false from returns (bool success).
# Callers MUST NOT assume that false is never returned!


# ----- balanceOf -----
# Returns the account balance of another account with address _owner.
# See: https://github.com/ethereum/vyper/issues/1241
# And: https://vyper.readthedocs.io/en/v0.1.0-beta.8/types.html?highlight=getter#mappings


# ----- transfer -----
# Transfers _value amount of tokens to address _to, and MUST fire the Transfer
# event. The function SHOULD throw if the _from account balance does not have
# enough tokens to spend.

# NOTE: Transfers of 0 values MUST be treated as normal transfers and fire the
# Transfer event.
@public
def transfer(_to: address, _value: uint256) -> bool:
    # NOTE: vyper does not allow unterflows
    #       so checks for sufficient funds are done implicitly
    #       see https://github.com/ethereum/vyper/issues/1237#issuecomment-461957413
    # substract balance from sender
    self.balanceOf[msg.sender] -= _value
    # add balance to recipient
    self.balanceOf[_to] += _value
    # fire transfer event
    log.Transfer(msg.sender, _to, _value)
    return True


# ----- transferFrom -----
# Transfers _value amount of tokens from address _from to address _to,
# and MUST fire the Transfer event.

# The transferFrom method is used for a withdraw workflow, allowing contracts
# to transfer tokens on your behalf. This can be used for example to allow a
# contract to transfer tokens on your behalf and/or to charge fees in
# sub-currencies. The function SHOULD throw unless the _from account has
# deliberately authorized the sender of the message via some mechanism.

# NOTE: Transfers of 0 values MUST be treated as normal transfers and fire the
# Transfer event.
@public
def transferFrom(_from: address, _to: address, _value: uint256) -> bool:
    # NOTE: vyper does not allow unterflows
    #       so checks for sufficient funds are done implicitly
    #       see https://github.com/ethereum/vyper/issues/1237#issuecomment-461957413
    # update approved funds
    self.approvedFunds[_from][msg.sender] -= _value
    # update sender balance
    self.balanceOf[_from] -= _value
    # update recipient balance
    self.balanceOf[_to] += _value
    # fire transfer event
    log.Transfer(_from, _to, _value)
    return True


# ----- approve -----
# Allows _spender to withdraw from your account multiple times, up to the _value
# amount. If this function is called again it overwrites the current allowance
# with _value.

# NOTE: To prevent attack vectors like the one described here and discussed here,
# clients SHOULD make sure to create user interfaces in such a way that they set
# the allowance first to 0 before setting it to another value for the same
# spender. THOUGH The contract itself shouldn't enforce it, to allow backwards
# compatibility with contracts deployed before.
@public
def approve(_spender: address, _value: uint256) -> bool:
    # overwrites the current allowance
    self.approvedFunds[msg.sender][_spender] = _value
    # fire approval event
    log.Approval(msg.sender, _spender, _value)
    return True


# ----- allowance -----
# Returns the amount which _spender is still allowed to withdraw from _owner.
@public
@constant
def allowance(_owner: address, _spender: address) -> uint256:
    return self.approvedFunds[_owner][_spender]
