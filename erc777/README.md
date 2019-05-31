# ERC777
https://eips.ethereum.org/EIPS/eip-777

The ERC777 Token Standard improves on the popular [ERC20](https://contracts.vyperhub.io/contracts/erc20) standard.

It's most defining feature is the use of the new [ERC1820](http://eips.ethereum.org/EIPS/eip-1820) interface standard which it uses in such a way, that each time a token is sent two things happen: 
1. The ERC777 contract It checks wether the sender of the transaction is a contract and wether that contract implements a tokensToSend(_operator, _from, _to, _amount, _data, _operatorData) function.
2. It checks wether the receiver of the transaction is a contract and wether that contract implements a tokensToSend(_operator, _from, _to, _amount, _data, _operatorData) function.

If the functions exist, then the code inside of both functions is executed. 
The exiting thing is, that there are no restrictions on what the code inside of the two functions looks like or what it does.

## Tests
Tests for this implementation can be found [here](https://github.com/0xjac/ERC777/tree/master/test).
