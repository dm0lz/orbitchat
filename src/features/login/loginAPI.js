export const fetchOrbitUsers = async (orbit) => {
  await orbit.load();
  const users = orbit
    .iterator({ limit: -1, reverse: true })
    .collect()
    .map((e) => ({
      hash: e.hash,
      peerId: e.payload.value.peerId,
      username: e.payload.value.username,
      timestamp: e.payload.value.timestamp,
    }));
  return users;
};

export const createOrbitUser = async (payload) => {
  const timestamp = Date.now();
  const { usersDb, ipfs } = payload.orbit;
  const { username } = payload;
  const peerId = await ipfs.id();
  try {
    const hash = await usersDb.add({
      peerId: peerId.id,
      username,
      timestamp,
    });
    return {
      hash,
      peerId: peerId.id,
      username,
      timestamp,
    };
  } catch (error) {
    console.log(error);
  }
};

export const removeOrbitUser = async (payload) => {
  await payload.orbit.remove(payload.hash);
  return payload.hash;
};
