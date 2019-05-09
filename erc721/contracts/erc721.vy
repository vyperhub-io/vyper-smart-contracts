# Author: Sören Steiger, github.com/ssteiger
# License: MIT

# ERC721 Token Standard
# https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md

# @dev Note: the ERC-165 identifier for this interface is 0x150b7a02.
# @notice Handle the receipt of an NFT
# @dev The ERC721 smart contract calls this function on the recipient
#      after a `transfer`.
#      This function MAY throw to revert and reject the transfer.
#      Return of other than the magic value MUST result in the transaction
#      being reverted.
# Note: the contract address is always the message sender.
# @param _operator The address which called `safeTransferFrom` function
# @param _from The address which previously owned the token
# @param _tokenId The NFT identifier which is being transferred
# @param _data Additional data with no specified format
# @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
#         unless throwing
# function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4);
contract ERC721TokenReceiver:
    def onERC721Received(
        _operator: address,
        _from: address,
        _tokenId: uint256,
        _data: bytes[256]
    ) -> bytes32: constant


# EVENTS:

# @dev This emits when ownership of any NFT changes by any mechanism.
#      This event emits when NFTs are created (`from` == 0) and destroyed
#      (`to` == 0).
#      Exception: during contract creation, any number of NFTs  may be created
#      and assigned without emitting Transfer.
#      At the time of any transfer, the approved address for that NFT (if any)
#      is reset to none.
Transfer: event({
    _from: indexed(address),
    _to: indexed(address),
    _tokenId: indexed(uint256)
})


# NOTE: This is not part of the standard
Mint: event({
    _to: indexed(address),
    _tokenId: indexed(uint256)
})


# @dev This emits when the approved address for an NFT is changed or reaffirmed.
#      The zero address indicates there is no approved address.
#      When a Transfer event emits, this also indicates that the approved
#      address for that NFT (if any) is reset to none.
Approval: event({
    _owner: indexed(address),
    _approved: indexed(address),
    _tokenId: indexed(uint256)
})


# @dev This emits when an operator is enabled or disabled for an owner.
#      The operator can manage all NFTs of the owner.
ApprovalForAll: event({
    _owner: indexed(address),
    _operator: indexed(address),
    _approved: bool
})


# STATE VARIABLES:

# NOTE: This is not part of the standard
contractOwner: public(address)
# Used for token id's
nftSupply: uint256

# Used to keep track of the number of tokens an address holds
nftCount: public(map(address, uint256))
ownerOfNFT: public(map(uint256, address))

operatorFor: public(map(uint256, address))
approvedForAll: public(map(address, map(address, bool)))

# Interface detection as specified in ERC165
# https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
supportedInterfaces: public(map(bytes32, bool))
# ERC165 interface ID's
ERC165_INTERFACE_ID: constant(bytes32) = 0x0000000000000000000000000000000000000000000000000000000001ffc9a7
ERC721_INTERFACE_ID: constant(bytes32) = 0x0000000000000000000000000000000000000000000000000000000080ac58cd


# METHODS:
@public
def __init__():
    # set initial supply (used for token id's)
    self.nftSupply = 0
    # set supported interfaces
    self.supportedInterfaces[ERC165_INTERFACE_ID] = True
    self.supportedInterfaces[ERC721_INTERFACE_ID] = True
    # set contract owner
    # NOTE: This is not part of the standard
    #       only contractOwner can call mint()
    self.contractOwner = msg.sender


@private
def _checkIfIsOwnerOrOperatorOrApprovedForAll(_msgSender: address, _from: address, _tokenId: uint256):
    # Throws unless `msg.sender` is
    # the current owner
    isOwner: bool = self.ownerOfNFT[_tokenId] == _msgSender
    # an authorized operator
    isOperator: bool = self.operatorFor[_tokenId] == _msgSender
    # or the approved address for this NFT
    isApprovedForAll: bool = (self.approvedForAll[_from])[_msgSender]
    assert (isOwner or isOperator or isApprovedForAll)


@private
def _setNewOwner(_currentOwner: address, _newOwner: address, _tokenId: uint256):
    # set new owner
    self.ownerOfNFT[_tokenId] = _newOwner
    # updated balances
    self.nftCount[_currentOwner] -= 1
    self.nftCount[_newOwner] += 1
    # reset operator
    # TODO: what about `approvedForAll`?
    self.operatorFor[_tokenId] = ZERO_ADDRESS


@private
def _transfer(_from: address, _to: address, _tokenId: uint256):
    # Throws if `_from` is not the current owner.
    assert self.ownerOfNFT[_tokenId] == _from
    # Throws if `_to` is the zero address.
    assert _to != ZERO_ADDRESS
    # Throws if `_tokenId` is not a valid NFT.
    assert self.ownerOfNFT[_tokenId] != ZERO_ADDRESS
    # transfer to new owner
    self._setNewOwner(_from, _to, _tokenId)
    # log transfer
    log.Transfer(_from, _to, _tokenId)


@public
@constant
def supportsInterface(_interfaceID: bytes32) -> bool:
    # Interface detection as specified in ERC165
    # https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
    return self.supportedInterfaces[_interfaceID]


# @notice Count all NFTs assigned to an owner
# @dev NFTs assigned to the zero address are considered invalid, and this
#      function throws for queries about the zero address.
# @param _owner An address for whom to query the balance
# @return The number of NFTs owned by `_owner`, possibly zero
# function balanceOf(address _owner) external view returns (uint256);
@public
@constant
def balanceOf(_owner: address) -> uint256:
    # NFTs assigned to the zero address are considered invalid, and this
    # function throws for queries about the zero address.
    assert _owner != ZERO_ADDRESS
    return self.nftCount[_owner]


# @notice Find the owner of an NFT
# @dev NFTs assigned to zero address are considered invalid, and queries
#      about them do throw.
# @param _tokenId The identifier for an NFT
# @return The address of the owner of the NFT
# function ownerOf(uint256 _tokenId) external view returns (address);
@public
@constant
def ownerOf(_tokenId: uint256) -> address:
    # NFTs assigned to the zero address are considered invalid, and this
    # function throws for queries about the zero address.
    owner: address = self.ownerOfNFT[_tokenId]
    assert owner != ZERO_ADDRESS
    return owner


# @notice Transfers the ownership of an NFT from one address to another address
# @dev Throws unless `msg.sender` is
#      the current owner,
#      an authorized operator,
#      or the approved address for this NFT.
#      Throws if `_from` is not the current owner.
#      Throws if `_to` is the zero address.
#      Throws if `_tokenId` is not a valid NFT.
#      When transfer is complete, this function checks if `_to` is
#      a smart contract (code size > 0).  If so, it calls
#      `onERC721Received` on `_to` and throws if the return value is not
#      `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
# @param _from The current owner of the NFT
# @param _to The new owner
# @param _tokenId The NFT to transfer
# @param data Additional data with no specified format, sent in call to `_to`
# function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable;
@public
@payable
def safeTransferFrom(_from: address, _to: address, _tokenId: uint256, _data: bytes[256]=""):
    # Throws unless `msg.sender` is
    # the current owner,
    # an authorized operator,
    # or the approved address for this NFT.
    self._checkIfIsOwnerOrOperatorOrApprovedForAll(msg.sender, _from, _tokenId)
    # transfer
    self._transfer(_from, _to, _tokenId)
    # When transfer is complete,
    # this function checks if `_to` is a smart contract (code size > 0)
    if _to.is_contract:
        # If so, it calls `onERC721Received` on `_to` and throws if the return value is not
        # `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
        returnValue: bytes32 = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data)
        assert returnValue == method_id("onERC721Received(address,address,uint256,bytes)", bytes32)


# @notice Transfers the ownership of an NFT from one address to another address
# @dev This works identically to the other function with an extra data
#      parameter, except this function just sets data to "".
# @param _from The current owner of the NFT
# @param _to The new owner
# @param _tokenId The NFT to transfer
# function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;


# @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
#         TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
#         THEY MAY BE PERMANENTLY LOST
# @dev Throws unless
#      `msg.sender` is the current owner,
#      an authorized operator,
#      or the approved address for this NFT.
#      Throws if `_from` is not the current owner.
#      Throws if `_to` is the zero address.
#      Throws if `_tokenId` is not a valid NFT.
# @param _from The current owner of the NFT
# @param _to The new owner
# @param _tokenId The NFT to transfer
# function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
@public
@payable
def transferFrom(_from: address, _to: address, _tokenId: uint256):
    # Throws unless `msg.sender` is
    # the current owner,
    # an authorized operator,
    # or the approved address for this NFT.
    self._checkIfIsOwnerOrOperatorOrApprovedForAll(msg.sender, _from, _tokenId)
    # do transfer
    self._transfer(_from, _to, _tokenId)


# @notice Change or reaffirm the approved address for an NFT
# @dev The zero address indicates there is no approved address.
#      Throws unless `msg.sender` is
#      the current NFT owner,
#      or an authorized operator of the current owner.
# @param _approved The new approved NFT controller
# @param _tokenId The NFT to approve
# function approve(address _approved, uint256 _tokenId) external payable;
@public
@payable
def approve(_approved: address, _tokenId: uint256):
    # Throws if _tokenId is not owned / a valid NFT
    assert self.ownerOfNFT[_tokenId] != ZERO_ADDRESS
    # Throws unless `msg.sender` is the current NFT owner
    isOwner: bool = self.ownerOfNFT[_tokenId] == msg.sender
    # or an authorized operator of the current owner.
    isOperator: bool = self.operatorFor[_tokenId] == msg.sender
    # TODO: does the this include approvedForAll?
    assert (isOwner or isOperator)
    # set new approved address
    self.operatorFor[_tokenId] = _approved
    # log change
    log.Approval(msg.sender, _approved, _tokenId)


# @notice Enable or disable approval for a third party ("operator") to manage
#         all of `msg.sender`'s assets
# @dev Emits the ApprovalForAll event.
#      The contract MUST allow multiple operators per owner.
# @param _operator Address to add to the set of authorized operators
# @param _approved True if the operator is approved, false to revoke approval
# function setApprovalForAll(address _operator, bool _approved) external;
@public
def setApprovalForAll(_operator: address, _approved: bool):
    # The contract MUST allow multiple operators per owner.
    self.approvedForAll[msg.sender][_operator] = _approved
    # log change
    log.ApprovalForAll(msg.sender, _operator, _approved)


# @notice Get the approved address for a single NFT
# @dev Throws if `_tokenId` is not a valid NFT.
# @param _tokenId The NFT to find the approved address for
# @return The approved address for this NFT, or the zero address if
#         there is none
# function getApproved(uint256 _tokenId) external view returns (address);
@public
@constant
def getApproved(_tokenId: uint256) -> address:
    # Throws if `_tokenId` is not a valid NFT.
    assert self.ownerOfNFT[_tokenId] != ZERO_ADDRESS
    return self.operatorFor[_tokenId]


# @notice Query if an address is an authorized operator for another address
# @param _owner The address that owns the NFTs
# @param _operator The address that acts on behalf of the owner
# @return True if `_operator` is an approved operator for `_owner`,
#         false otherwise
# function isApprovedForAll(address _owner, address _operator) external view returns (bool);
@public
@constant
def isApprovedForAll(_owner: address, _operator: address) -> bool:
    return (self.approvedForAll[_owner])[_operator]


# NOTE: This is not part of the standard
@public
def mint() -> uint256:
    # only contractOwner is allowed to mint
    assert msg.sender == self.contractOwner
    # update supply
    tokenId: uint256 = self.nftSupply
    self.nftSupply += 1
    # update ownership
    self.ownerOfNFT[tokenId] = msg.sender
    self.nftCount[msg.sender] += 1
    self.operatorFor[tokenId] = ZERO_ADDRESS
    # log mint
    log.Mint(msg.sender, tokenId)
    return tokenId
