This project is a serverless Dapp chat using [Orbit-db](https://github.com/orbitdb/orbit-db/) and [IPFS](https://github.com/ipfs/ipfs). It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template. It can take up to 30 seconds for the peers discovery to happen. You can check it [here](https://ipfs.io/ipfs/QmNZrEwobXAat1C451pK5KYuEdtPpoer5KAdCjBQw22cJg).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

It's recommended using a local [signaling server](https://github.com/libp2p/js-libp2p-webrtc-star) for development purpose.

### `npm install --global libp2p-webrtc-star`

### `star-signal --port=13579 --host=127.0.0.1`
