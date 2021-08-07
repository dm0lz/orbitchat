import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newTicker } from "./cryptoSlice";
// import { useHistory } from "react-router-dom";
import Websocket from "react-websocket";
// import styles from "./Todo.module.css";
import { TickerCard } from "./TickerCard";

export function Crypto(props) {
  const dispatch = useDispatch();
  let refWebSocket = useRef();
  const aavePrice = useSelector((state) => state.crypto.aavePrice);
  const btcPrice = useSelector((state) => state.crypto.btcPrice);
  const ethPrice = useSelector((state) => state.crypto.ethPrice);

  const handleWsOpen = (event) => {
    const message = {
      type: "subscribe",
      channels: [
        {
          name: "ticker",
          product_ids: ["AAVE-USD", "ETH-USD", "BTC-USD"],
        },
      ],
    };
    refWebSocket.sendMessage(JSON.stringify(message));
  };

  const handleWsData = (event) => {
    const msg = JSON.parse(event);
    dispatch(newTicker(msg));
  };

  return (
    <div className="container">
      <div className="row pt-5">
        <div className="col-sm-4 ">
          <TickerCard price={aavePrice} ticker="AAVE" />
        </div>
        <div className="col-sm-4 ">
          <TickerCard price={ethPrice} ticker="ETH" />
        </div>
        <div className="col-sm-4 ">
          <TickerCard price={btcPrice} ticker="BTC" />
        </div>
      </div>
      <Websocket
        url="wss://ws-feed.pro.coinbase.com"
        onMessage={handleWsData}
        onOpen={handleWsOpen}
        ref={(Websocket) => {
          refWebSocket = Websocket;
        }}
      />
    </div>
  );
}
