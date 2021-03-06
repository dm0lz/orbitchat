This project is a serverless video chat using [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API), [IPFS](https://github.com/ipfs/ipfs) and [Orbit-db](https://github.com/orbitdb/orbit-db/). It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template. It can take some time for the peers discovery to happen so be patient. You can check it [here](https://dchat.tk).

## Available Scripts

In the project directory, you can run:

### `yarn install`

and

### `yarn start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

It's recommended using a local [signaling server](https://github.com/libp2p/js-libp2p-webrtc-star) for development purpose (uncomment src/app/orbit.js:32).

### `npm install --global libp2p-webrtc-star`

### `star-signal --port=13579 --host=127.0.0.1`
