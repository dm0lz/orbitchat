export const fetchOrbitMessages = async (orbit) => {
  await orbit.load();
  const items = orbit
    .iterator({ limit: -1, reverse: false })
    .collect()
    .map((e) => ({
      hash: e.hash,
      message: e.payload.value.message,
      username: e.payload.value.username,
      timestamp: e.payload.value.timestamp,
    }));
  return items;
};

export const fetchOrbitEvents = async (orbit) => {
  await orbit.load();
  const items = orbit
    .iterator({ limit: -1, reverse: true })
    .collect()
    .map((e) => ({
      hash: e.hash,
      action: e.payload.value.action,
      username: e.payload.value.username,
      timestamp: e.payload.value.timestamp,
    }));
  return items;
};

export const addOrbitEvent = async (payload) => {
  const timestamp = Date.now();
  const { action, username } = payload;
  try {
    const hash = await payload.orbit.add({
      action: action,
      username: username,
      timestamp,
    });
    return {
      action: action,
      username: username,
      hash,
      timestamp,
    };
  } catch (error) {
    console.log(error);
  }
};

export const addOrbitMessage = async (payload) => {
  const timestamp = Date.now();
  const { message, username } = payload;
  try {
    const hash = await payload.orbit.add({
      message: message,
      username: username,
      timestamp,
    });
    return {
      message: message,
      username: username,
      hash,
      timestamp,
    };
  } catch (error) {
    console.log(error);
  }
};

export const removeOrbitMessage = async (payload) => {
  await payload.orbit.remove(payload.hash);
  return payload.hash;
};
