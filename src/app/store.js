import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import chatReducer from "../features/chat/chatSlice";
import homeReducer from "../features/home/homeSlice";
import cryptoReducer from "../features/crypto/cryptoSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    chat: chatReducer,
    home: homeReducer,
    crypto: cryptoReducer,
  },
});
