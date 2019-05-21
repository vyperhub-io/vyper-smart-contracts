# Author: Sören Steiger, github.com/ssteiger
# License: MIT

# ERC777 Token Standard (https://eips.ethereum.org/EIPS/eip-777)

# NOTICE: This contract is a work-in-progress and should not be used in production!

# Interface for ERC1820 registry contract (http://eips.ethereum.org/EIPS/eip-1820)
contract ERC1820Registry:
    def setInterfaceImplementer(
        _addr: address,
        _interfaceHash: bytes32,
        _implementer: address,
    ): modifying
    def getInterfaceImplementer(
        _addr: address,
        _interfaceHash: bytes32,
    ) -> address: modifying

# Interface for ERC777Tokens sender contracts
contract ERC777TokensSender:
    def tokensToSend(
        _operator: address,
        _from: address,
        _to: address,
        _amount: uint256,
        _data: bytes[256],
        _operatorData: bytes[256]
    ): modifying

# Interface for ERC777Tokens recipient contracts
contract ERC777TokensRecipient:
    def tokensReceived(
        _operator: address,
        _from: address,
        _to: address,
        _amount: uint256,
        _data: bytes[256],
        _operatorData: bytes[256]
    ): modifying


Sent: event({
    _operator: indexed(address), # Address which triggered the send.
    _from: indexed(address),     # Token holder.
    _to: indexed(address),       # Token recipient.
    _amount: uint256,            # Number of tokens to send.
    _data: bytes[256],           # Information provided by the token holder.
    _operatorData: bytes[256]    # Information provided by the operator.
})

Minted: event({
    _operator: indexed(address), # Address which triggered the burn.
    _to: indexed(address),       # Holder whose tokens were burned.
    _amount: uint256,            # Number of tokens burned.
    _data: bytes[256],           # Information provided by the holder.
    _operatorData: bytes[256]    # Information provided by the operator.
})

Burned: event({
    _operator: indexed(address), # Address which triggered the burn.
    _from: indexed(address),     # Token holder whose tokens are burned.
    _amount: uint256,            # Token holder whose tokens are burned.
    _data: bytes[256],           # Information provided by the token holder.
    _operatorData: bytes[256]    # Information provided by the operator.
})

AuthorizedOperator: event({
    _operator: indexed(address), # Address which became an operator of tokenHolder.
    _holder: indexed(address)    # Address of a token holder which authorized the operator address as an operator.
})

RevokedOperator: event({
    _operator: indexed(address), # Address which was revoked as an operator of tokenHolder.
    _holder: indexed(address)    # Address of a token holder which revoked the operator address as an operator.
})


name: public(string[64])
symbol: public(string[32])
totalSupply: public(uint256)
granularity: public(uint256)

balanceOf: map(address, uint256)

defaultOperators: map(address, bool)
operators: map(address, map(address, bool))

erc1820Registry_Address: constant(address) = 0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24
erc1820Registry: ERC1820Registry

@public
def __init__(
    _name: string[32],
    _symbol: string[16],
    _totalSupply: uint256,
    _granularity: uint256,
    _defaultOperators: address[4]
  ):
    self.name = _name
    self.symbol = _symbol
    self.totalSupply = _totalSupply * 10 ** _granularity
    self.granularity = _granularity
    for i in range(4):
        if _defaultOperators[i] != ZERO_ADDRESS:
            self.defaultOperators[_defaultOperators[i]] = True
    self.erc1820Registry = ERC1820Registry(erc1820Registry_Address)
    self.erc1820Registry.setInterfaceImplementer(self, keccak256('ERC777Token'), self)


@private
@constant
def _checkForERC777TokensInterface_Sender(
    _operator: address,
    _from: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256]="",
    _operatorData: bytes[256]=""
  ):
    implementer: address = self.erc1820Registry.getInterfaceImplementer(_from, keccak256('ERC777TokensSender'))
    if implementer != ZERO_ADDRESS:
        ERC777TokensSender(_from).tokensToSend(_operator, _from, _to, _amount, _data, _operatorData)


@private
@constant
def _checkForERC777TokensInterface_Recipient(
    _operator: address,
    _from: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256]="",
    _operatorData: bytes[256]=""
  ):
    implementer: address = self.erc1820Registry.getInterfaceImplementer(_from, keccak256('ER777TokenRecipient'))
    if implementer != ZERO_ADDRESS:
        ERC777TokensRecipient(_to).tokensReceived(_operator, _from, _to, _amount, _data, _operatorData)


@private
def _transferFunds(
    _operator: address,
    _from: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256]="",
    _operatorData: bytes[256]=""
  ):
    # any minting, sending or burning of tokens MUST be a multiple of the granularity value.
    assert _amount % self.granularity == 0
    if _from.is_contract:
        self._checkForERC777TokensInterface_Sender(_operator, _from, _to, _amount, _data, _operatorData)
    self.balanceOf[_from] -= _amount
    self.balanceOf[_to] += _amount
    # only check for `tokensReceived` hook if transfer is not a burn
    if _to != ZERO_ADDRESS:
        if _to.is_contract:
            self._checkForERC777TokensInterface_Recipient(_operator, _from, _to, _amount, _data, _operatorData)


@public
@constant
def isOperatorFor(_operator: address, _holder: address) -> bool:
    return (self.operators[_holder])[_operator] or self.defaultOperators[_operator] or _operator == msg.sender


@public
def authorizeOperator(_operator: address):
    (self.operators[msg.sender])[_operator] = True
    log.AuthorizedOperator(_operator, msg.sender)


@public
def revokeOperator(_operator: address):
    (self.operators[msg.sender])[_operator] = False
    log.RevokedOperator(_operator, msg.sender)


@public
def send(_to: address, _amount: uint256, _data: bytes[256]=""):
    assert _to != ZERO_ADDRESS
    operatorData: bytes[256]=""
    self._transferFunds(msg.sender, msg.sender, _to, _amount, _data, operatorData)
    log.Sent(msg.sender, msg.sender, _to, _amount, _data, operatorData)


@public
def operatorSend(
    _from: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256]="",
    _operatorData: bytes[256]=""
  ):
    assert _to != ZERO_ADDRESS
    assert self.isOperatorFor(msg.sender, _from)
    self._transferFunds(msg.sender, _from, _to, _amount, _data, _operatorData)
    log.Sent(msg.sender, _from, _to, _amount, _data, _operatorData)


@public
def burn(_amount: uint256, _data: bytes[256]=""):
    self._transferFunds(msg.sender, msg.sender, ZERO_ADDRESS, _amount, _data)
    self.totalSupply -= _amount
    operatorData: bytes[256]=""
    log.Burned(msg.sender, msg.sender, _amount, _data, operatorData)


@public
def operatorBurn(
    _from: address,
    _amount: uint256,
    _data: bytes[256]="",
    _operatorData: bytes[256]=""
  ):
    # _from: Token holder whose tokens will be burned (or 0x0 to set from to msg.sender).
    fromAddress: address
    if _from == ZERO_ADDRESS:
        fromAddress = msg.sender
    else:
        fromAddress = _from
    assert self.isOperatorFor(msg.sender, fromAddress)
    self._transferFunds(msg.sender, fromAddress, ZERO_ADDRESS, _amount, _data, _operatorData)
    self.totalSupply -= _amount
    log.Burned(msg.sender, fromAddress, _amount, _data, _operatorData)


# NOTE: ERC777 intentionally does not define specific functions to mint tokens.
@public
def mint(
    _operator: address,
    _to: address,
    _amount: uint256,
    _operatorData: bytes[256]=""
  ):
    data: bytes[256]=""
    assert _to != ZERO_ADDRESS
    # only operators are allowed to mint
    assert self.defaultOperators[msg.sender]
    self.balanceOf[_to] += _amount
    self.totalSupply += _amount
    if _to.is_contract:
        self._checkForERC777TokensInterface_Recipient(_operator, ZERO_ADDRESS, _to, _amount, data, _operatorData)
    log.Minted(msg.sender, _to, _amount, data, _operatorData)
