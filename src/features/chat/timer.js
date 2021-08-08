import React from "react";
import { useStopwatch } from "react-timer-hook";

export default function Timer() {
  const { seconds, minutes, hours, days, isRunning, start, pause, reset } =
    useStopwatch({ autoStart: true });

  return (
    <span style={{}}>
      {/* <h1>react-timer-hook</h1>
      <p>Stopwatch Demo</p> */}
      <span style={{}}>
        <span>Waiting for peers {minutes}</span>:<span>{seconds}</span>
      </span>
      {/* <p>{isRunning ? 'Running' : 'Not running'}</p>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={reset}>Reset</button> */}
    </span>
  );
}
