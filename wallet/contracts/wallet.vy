# Author: Sören Steiger, github.com/ssteiger
# License: MIT

contract ERC1820Registry:
    def setInterfaceImplementer(
        _addr: address,
        _interfaceHash: bytes32,
        _implementer: address
    ): modifying


contract ERC20Token:
    def transfer(
        _to: address,
        _value: uint256
    ) -> bool: modifying


contract ERC721Token:
    def safeTransferFrom(
        _from: address,
        _to: address,
        _tokenId: uint256,
        _data: bytes[256]
    ): modifying


contract ERC777Token:
    def send(
        _to: address,
        _amount: uint256,
        _data: bytes[256]
    ): modifying


ETHReceived: event({
    _from: address,
    _amount: wei_value
})

ETHSent: event({
    _to: address,
    _amount: uint256
})

# TODO:
ERC20Received: event({

})

ERC20Sent: event({
    _token: address,
    _to: address,
    _amount: uint256
})

ERC721Received: event({
    _token: address,
    _from: address,
    _tokenId: uint256,
    _data: bytes32
})

ERC721Sent: event({
    _token: address,
    _from: address,
    _to: address,
    _tokenId: uint256,
    _data: bytes[256]
})

ERC777Received: event({
    _operator: indexed(address),
    _from: indexed(address),
    _to: indexed(address),
    _amount: uint256,
    _data: bytes[256],
    _operatorData: bytes[256]
})

ERC777Sent: event({
    _operator: indexed(address),
    _from: indexed(address),
    _to: indexed(address),
    _amount: uint256,
    _data: bytes[256],
    _operatorData: bytes[256]
})


erc1820Registry: ERC1820Registry
erc1820RegistryAddress: constant(address) = 0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24

owner: public(address)


@public
def __init__():
    self.owner = msg.sender
    self.erc1820Registry = ERC1820Registry(erc1820RegistryAddress)
    self.erc1820Registry.setInterfaceImplementer(self, keccak256("ERC777TokensRecipient"), self)
    self.erc1820Registry.setInterfaceImplementer(self, keccak256("ERC777TokensSender"), self)


# ETH
@public
@payable
def __default__():
    log.ETHReceived(msg.sender, msg.value)


@public
def sendETH(
    _to: address,
    _amount: uint256
  ):
    send(_to, _amount)
    log.ETHSent(_to, _amount)


@public
def sendERC20(
    _token: address,
    _to: address,
    _amount: uint256
  ):
    ERC20Token(_token).transfer(_to, _amount)
    log.ERC20Sent(_token, _to, _amount)


@public
def sendERC721(
    _token: address,
    _to: address,
    _tokenId: uint256,
    _data: bytes[256]=""
  ):
    ERC721Token(_token).safeTransferFrom(self, _to, _tokenId, _data)
    log.ERC721Sent(_token, self, _to, _tokenId, _data)


# ERC721
@public
def onERC721Received(
    _token: address,
    _from: address,
    _tokenId: uint256,
    _data: bytes32
  ) -> bytes32:
    log.ERC721Received(_token, _from, _tokenId, _data)
    # TODO: need to return bytes4
    return keccak256("onERC721Received(address,address,uint256,bytes)")


@public
def sendERC777(
    _token: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256]=""
  ):
    ERC777Token(_token).send(_to, _amount, _data)


# ERC777 Hooks
@public
def tokensReceived(
    _operator: address,
    _from: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256],
    _operatorData: bytes[256]
  ):
    log.ERC777Received(_operator, _from, _to, _amount, _data, _operatorData)


@public
def tokensToSend(
    _operator: address,
    _from: address,
    _to: address,
    _amount: uint256,
    _data: bytes[256],
    _operatorData: bytes[256]
  ):
    log.ERC777Sent(_operator, _from, _to, _amount, _data, _operatorData)
