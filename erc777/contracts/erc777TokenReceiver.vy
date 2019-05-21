# Author: Sören Steiger, github.com/ssteiger
# License: MIT

# ERC777 Token Receiver (https://eips.ethereum.org/EIPS/eip-777)

# Interface for ERC1820 registry contract (http://eips.ethereum.org/EIPS/eip-1820)
contract ERC1820Registry:
    def setInterfaceImplementer(
        _addr: address,
        _interfaceHash: bytes32,
        _implementer: address,
    ): modifying


TokensReceived: event({
    _operator: indexed(address),
    _from: indexed(address),
    _to: indexed(address),
    _amount: uint256,
    _data: bytes[256],
    _operatorData: bytes[256]
})


erc1820Registry: ERC1820Registry


@public
def __init__():
    self.erc1820Registry = ERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24)
    self.erc1820Registry.setInterfaceImplementer(self, keccak256('ERC777TokensRecipient'), self)


@private
def tokensReceived(
    _operator: address,
    _from: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256],
    _operatorData: bytes[256]
  ):
  log.TokensReceived(_operator, _from, _to, _amount, _data, _operatorData)
