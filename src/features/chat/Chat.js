import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import {
  addMessage,
  getMessages,
  fetchMessages,
  removeMessage,
  addPeer,
  fetchEvents,
  addEvent,
  updatePeers,
} from "./chatSlice";
import { fetchUsers } from "../home/homeSlice";
import styles from "./Chat.module.css";
// import { useInterval } from "../../hooks/useInterval";
import moment from "moment";
import { store } from "../../app/store";
import { userSelector } from "../home/homeSlice";

const groupBy = (items, key) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {}
  );

const ChatMessagesWrapper = styled.div`
  max-height: 550px;
  overflow-y: scroll;
`;

const InputWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  width: 75%;
  background-color: #f4f5fb;
  @media (max-width: 660px) {
    width: 96%;
  }
`;

const Avatar = styled.img`
  width: 50px;
  border-radius: 30px;
`;

const AvatarWrapper = styled.div`
  position: absolute;
  left: 20px;
  bottom: 9px;
`;

export function Chat(props) {
  const messages = useSelector(getMessages);
  const username = useSelector(userSelector);
  const peers = useSelector((state) => state.chat.peers);
  const users = useSelector((state) => state.home.users);
  const events = useSelector((state) => state.chat.events);
  const groupedEvents = groupBy(events, "username");
  let peerUsers = peers.map((peer) =>
    users.find((user) => user.peerId === peer)
  );
  peerUsers = peerUsers.filter((user) => user);
  const typing = peerUsers.map((user) => {
    if (groupedEvents[user.username]) {
      const isTyping = groupedEvents[user.username][0].action === "FOCUS_IN";
      return isTyping ? user.username : null;
    }
    return null;
  });
  const typingPeers = typing.filter((el) => el);
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const history = useHistory();
  const { messagesDb, usersDb, eventsDb, ipfs } = props.orbit;
  const messagesEndRef = useRef(null);
  window.store = store;
  window.addMessage = addMessage;
  window.orbit = props.orbit;
  // window.store.dispatch(window.addMessage({orbit: window.orbit.messagesDb, message: "from console", username: "doe"}))

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  useEffect(() => {
    if (eventsDb && Object.keys(eventsDb).length !== 0) {
      dispatch(fetchEvents(eventsDb));
      eventsDb.events.on("replicated", (address) => {
        console.log("events replicated");
        dispatch(fetchEvents(eventsDb));
      });
    }
  }, [eventsDb]);

  useEffect(() => {
    if (usersDb && Object.keys(usersDb).length !== 0) {
      dispatch(fetchUsers(usersDb));
      usersDb.events.on("replicated", (address) => {
        console.log("users replicated");
        dispatch(fetchUsers(usersDb));
      });
      usersDb.events.on("replicate", (address) => {
        console.log("users replicate");
      });
      usersDb.events.on("peer", (peer) => {
        console.log("user new peer detected");
        console.log(peer);
        dispatch(addPeer(peer));
      });
      usersDb.events.on("peer.exchanged", (peer, address, heads) => {
        console.log("user peer exchanged");
        dispatch(addPeer(peer));
      });
    }
  }, [usersDb]);

  useEffect(() => {
    if (messagesDb && Object.keys(messagesDb).length !== 0) {
      dispatch(fetchMessages(messagesDb));
      messagesDb.events.on("replicated", (address) => {
        console.log("feed replicated");
        dispatch(fetchMessages(messagesDb));
      });
      messagesDb.events.on("replicate", (address) => {
        console.log("feed replicate");
      });
      messagesDb.events.on("peer", (peer) => {
        console.log("feed new peer detected");
        console.log(peer);
        dispatch(addPeer(peer));
      });
      messagesDb.events.on("peer.exchanged", (peer, address, heads) => {
        console.log("feed peer exchanged");
        dispatch(addPeer(peer));
      });
      // const interval = setInterval(() => {
      //   dispatch(fetchMessages(messagesDb));
      // }, 6000);
      // return () => clearInterval(interval);
    }
  }, [messagesDb]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (username.length === 0) {
      history.push("/");
    }
  }, [username]);

  // useEffect(() => {
  //   if (ipfs && Object.keys(ipfs).length !== 0) {
  //     (async (dispatch) => {
  //       const interval = setInterval(async () => {
  //         const swarmPeers = await ipfs.swarm.peers();
  //         const peerIds = swarmPeers.map((peer) => peer.peer);
  //         dispatch(updatePeers(peerIds));
  //       }, 10000);
  //       return () => clearInterval(interval);
  //     })(dispatch);
  //   }
  // }, [ipfs]);

  const inputSubmit = () => {
    if (input.length && username.length) {
      dispatch(addMessage({ orbit: messagesDb, message: input, username }));
      setInput("");
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return moment(date).startOf("second").fromNow();
  };

  const remove = (el) => {
    dispatch(
      removeMessage({
        hash: el.target.getAttribute("hash"),
        orbit: messagesDb,
      })
    );
  };

  const focusIn = () => {
    dispatch(addEvent({ orbit: eventsDb, action: "FOCUS_IN", username }));
  };

  const focusOut = () => {
    dispatch(addEvent({ orbit: eventsDb, action: "FOCUS_OUT", username }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const orderedMessages = messages
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp);
  return (
    <div className={`container ${styles.containerWrapper}`}>
      <div className="row">
        <div className="col-sm-2 col-md-1"></div>
        <div className="col-sm-8 col-md-10">
          <h3>
            Orbit Chat - {peers.length} connected peers :{" "}
            {peerUsers.map((peer) => peer.username).join(", ")}
          </h3>
          <div>
            <br />
            <ChatMessagesWrapper>
              {orderedMessages.map((item, index) => (
                <div key={item.hash}>
                  <div
                    className={`card w-50 ${
                      index % 2 === 0 ? styles.alignRight : styles.alignLeft
                    } m-3`}
                  >
                    <div className={`card-body `}>
                      <AvatarWrapper>
                        <Avatar
                          src="https://www.bootdey.com/img/Content/avatar/avatar3.png"
                          alt=""
                        />
                        <div>
                          <strong>{item.username}</strong>
                        </div>
                      </AvatarWrapper>
                      <p>{item.message}</p>
                      <div className={styles.textRight}>
                        {formatDate(item.timestamp)}
                      </div>
                      <button
                        onClick={remove}
                        hash={item.hash}
                        className={`btn btn-danger ${styles.delete}`}
                      >
                        <i
                          class="bi-trash"
                          onClick={remove}
                          hash={item.hash}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ChatMessagesWrapper>
            <br />
            <br />
            <InputWrapper>
              {typingPeers.length ? (
                <p>{typingPeers.join(", ")} is typing...</p>
              ) : (
                <br />
              )}
              <textarea
                type="text"
                value={input}
                onChange={handleInputChange}
                name="input"
                className="form-control"
                onFocus={focusIn}
                onBlur={focusOut}
              />
              <hr />
              <button onClick={inputSubmit} className="btn btn-success w-100">
                Submit
              </button>
            </InputWrapper>
          </div>
        </div>
        <div className="col-sm-2 col-md-1"></div>
      </div>
    </div>
  );
}
