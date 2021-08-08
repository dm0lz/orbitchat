import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchOrbitMessages,
  addOrbitMessage,
  removeOrbitMessage,
} from "./chatAPI";

const initialState = {
  messages: [],
  status: "idle",
  peers: [],
  events: [],
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (orbit) => {
    const response = await fetchOrbitMessages(orbit);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

export const addMessage = createAsyncThunk(
  "chat/addMessage",
  async (payload, el) => {
    const response = await addOrbitMessage(payload);
    return response;
  }
);

export const removeMessage = createAsyncThunk(
  "chat/removeMessage",
  async (payload, event) => {
    const response = await removeOrbitMessage({
      orbit: payload.orbit,
      hash: payload.hash,
    });
    return response;
  }
);

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addEvent: (state, action) => {
      state.events.unshift(action.payload);
    },
    addPeer: (state, action) => {
      state.peers = [...new Set([...state.peers, action.payload])];
    },
    removePeer: (state, action) => {
      state.peers = state.peers.filter((peer) => peer !== action.payload);
    },
    updatePeers: (state, action) => {
      state.peers = state.peers.filter((peer) => action.payload.includes(peer));
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(addMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addMessage.fulfilled, (state, action) => {
        state.status = "idle";
        state.messages.push(action.payload);
      })
      .addCase(removeMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeMessage.fulfilled, (state, action) => {
        state.status = "idle";
        state.messages = state.messages.filter(
          (item) => item.hash !== action.payload
        );
      })
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "idle";
        state.messages = action.payload;
      });
  },
});

export const { addPeer, updatePeers, removePeer, addEvent } = chatSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const getMessages = (state) => state.chat.messages;
// export const orbitSelector = (state) => state.orbit;
export const statusSelector = (state) => state.chat.status;
// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd = (amount) => (dispatch, getState) => {
//   const currentValue = selectCount(getState());
//   if (currentValue % 2 === 1) {
//     dispatch(incrementByAmount(amount));
//   }
// };

export default chatSlice.reducer;
