import React, { useState, useEffect, useRef } from "react";
import styles from "./Crypto.module.css";
import { usePrevious } from "../../hooks/usePrevious";

export function TickerCard(props) {
  const prevPrice = usePrevious(props.price);
  const tick = prevPrice !== props.price;

  // const prevPriceRef = useRef();
  // useEffect(() => {
  //   prevPriceRef.current = props.price;
  // }, [props.price]);
  // const prevPrice = prevPriceRef.current;
  // const tick = prevPrice !== props.price;

  return (
    <div className="card">
      <div className="card-body">
        {props.ticker} :{" "}
        <h1 className={tick ? styles.red : styles.black}>{props.price}</h1>
      </div>
    </div>
  );
}
