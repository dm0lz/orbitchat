import IPFS from "ipfs";
const OrbitDB = require("orbit-db");

export const orbitInstance = async () => {
  try {
    // const ipfsOptions =  {repo: 'ipfs' + Math.random()};
    // const ipfsOptions = { repo: "./ipfs" };
    // const ipfsOptions = { repo: "/orbitdb/orbitchat/browser/new/ipfs/0.0.1" };
    // const ipfs = await IPFS.create(ipfsOptions);
    // window.LOG = "Verbose";
    const ipfs = await IPFS.create({
      repo: "/orbitdb/orbitchat/browser/new/ipfs/0.0.1",
      start: true,
      preload: {
        enabled: true,
      },
      EXPERIMENTAL: {
        pubsub: true,
      },
      relay: { enabled: true, hop: { enabled: true, active: true } },
      config: {
        Addresses: {
          Swarm: [
            // Use IPFS dev signal server
            // "/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star",
            // "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
            // Use IPFS dev webrtc signal server
            // "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
            // "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
            // "/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/",
            // Use local signal server
            "/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star",
          ],
        },
      },
    });
    const orbitdb = await OrbitDB.createInstance(ipfs);

    const options = {
      accessController: {
        write: ["*"],
      },
      replicate: true,
      create: true,
      sync: true,
      localOnly: false,
      write: ["*"],
    };

    // const options = {
    //   write: ["*"],
    // };
    // const db = await orbitdb.feed("orbitchat.events", options);
    const messagesDb = await orbitdb.open(
      "/orbitdb/zdpuAwNRaakdMhomxjUYWpDsU3cj3vMP5dgx1mhzvMzHBprab/orbitchat.messages",
      options
    );
    const usersDb = await orbitdb.open(
      "/orbitdb/zdpuB2wKeHGiVM9GK8vXeiRgadAshDbfik1yRByyAqFGu1vX4/orbitchat.users",
      options
    );
    const eventsDb = await orbitdb.open(
      "/orbitdb/zdpuAobdDUHrpWrLpPoZAGrH2TLWYpmeAha5ySxbnvHyW51dP/orbitchat.events",
      options
    );
    // const db = await orbitdb.open(
    //   "/orbitdb/zdpuAwcCyQtPjEKLzgnDqo44WeMtLuQQnmwBzUMxMQgev3KfH/orbit-db.messages",
    //   {
    //     // If database doesn't exist, create it
    //     create: false,
    //     overwrite: false,
    //     // Load only the local version of the database,
    //     // don't load the latest from the network yet
    //     localOnly: false,
    //     type: "feed",
    //     // If "Public" flag is set, allow anyone to write to the database,
    //     // otherwise only the creator of the database can write
    //     accessController: {
    //       write: ["*"],
    //     },
    //   }
    // );
    // const db = await orbitdb.feed(
    //   "/orbitdb/zdpuAwcCyQtPjEKLzgnDqo44WeMtLuQQnmwBzUMxMQgev3KfH/orbit-db.messages"
    // );

    await messagesDb.load();
    await usersDb.load();
    await eventsDb.load();
    return { messagesDb, usersDb, eventsDb, ipfs };
  } catch (error) {
    console.log(error);
  }
};
