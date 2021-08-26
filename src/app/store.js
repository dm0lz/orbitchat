import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import chatReducer from "../features/chat/chatSlice";
import loginReducer from "../features/login/loginSlice";
import cryptoReducer from "../features/crypto/cryptoSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    chat: chatReducer,
    login: loginReducer,
    crypto: cryptoReducer,
  },
});
