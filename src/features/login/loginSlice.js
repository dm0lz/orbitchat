import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createOrbitUser, fetchOrbitUsers, removeOrbitUser } from "./loginAPI";

const initialState = {
  username: "",
  errors: [],
  status: "idle",
  users: [],
};

export const fetchUsers = createAsyncThunk(
  "login/fetchUsers",
  async (payload, obj) => {
    const response = await fetchOrbitUsers(payload);
    return response;
  }
);

export const createUser = createAsyncThunk(
  "login/createUser",
  async (payload, obj) => {
    try {
      const users = await fetchOrbitUsers(payload.orbit.usersDb);
      obj.dispatch(usersFetched(users));
      const existingUser = users.find(
        (user) => user.username === payload.username
      );
      const peerId = await payload.orbit.ipfs.id();
      if (existingUser) {
        if (existingUser.peerId === peerId.id) {
          return { username: existingUser.username };
        } else {
          obj.dispatch(usernameError("Username already exists"));
          return { username: "" };
        }
      } else {
        const existingAccount = users.find((user) => user.peerId === peerId.id);
        if (existingAccount) {
          return { username: existingAccount.username };
        } else {
          const response = await createOrbitUser(payload);
          return response;
        }
      }
    } catch (error) {
      return obj.dispatch(usernameError(error.message));
    }
  }
);

export const destroyUser = createAsyncThunk(
  "login/destroyUser",
  async (payload, obj) => {
    const response = await removeOrbitUser(payload);
    return response;
  }
);

export const loginSlice = createSlice({
  name: "login",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    usernameError: (state, action) => {
      if (action.payload === null) {
        state.errors = [];
      } else {
        state.errors = [...new Set([...state.errors, action.payload])];
      }
    },
    usersFetched: (state, action) => {
      state.users = action.payload;
    },
    loadingStatus: (state, action) => {
      state.status = action.payload;
    },
    // setUser: {
    //   reducer(state, action) {
    //     state.username = action.payload.username;
    //   },
    //   prepare(username) {
    //     return {
    //       payload: {
    //         // id: nanoid(),
    //         username: username,
    //         extra: "zz",
    //       },
    //     };
    //   },
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload.username) {
          state.username = action.payload.username;
        }
      })
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "idle";
        state.users = action.payload;
      });
  },
});

export const { usernameError, usersFetched, loadingStatus } =
  loginSlice.actions;

export const userSelector = (state) => state.login.username;
// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd = (amount) => (dispatch, getState) => {
//   const currentValue = selectCount(getState());
//   if (currentValue % 2 === 1) {
//     dispatch(incrementByAmount(amount));
//   }
// };

export default loginSlice.reducer;
