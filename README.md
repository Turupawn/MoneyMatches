# What?

Money matches on the blockchain.

Live demo on Rinkeby network [rinkeby.atomicbuster.com](http://rinkeby.atomicbuster.com/)

## How?

Atomic Buster's ethereum smart contract simplifies the interaction between Players, Community Managers and Bettors.

* `Players` are incentivized to win
* `Community Managers` are incentivized to keep hosting events
* `Bettors` are incentivized to keep betting and supporting the community

## Compile, run and build

1. Compile and run the contract on either `ganache` or `rinkeby`

```
truffle migrate --network ganache
```

2. Run the client

```
cd client
npm start
```

3. Build the client for production

```
npm run build
```

## Stack

* [React Box](https://github.com/truffle-box/react-box) truffle + react + webpack bundle
* [IPFS](https://ipfs.io/) InterPlanetary File System
* [Rimble](https://rimble.consensys.design) UI
* [3Box](https://3box.io/)'s user data
* [Recharts](http://recharts.org/) charts


