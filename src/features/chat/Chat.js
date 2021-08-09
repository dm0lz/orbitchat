import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Room from "ipfs-pubsub-room";
import {
  addMessage,
  getMessages,
  fetchMessages,
  removeMessage,
  addPeer,
  removePeer,
  addEvent,
} from "./chatSlice";
import { fetchUsers } from "../home/homeSlice";
import styles from "./Chat.module.css";
import moment from "moment";
import { store } from "../../app/store";
import { userSelector } from "../home/homeSlice";
import Timer from "./timer";
import useWindowDimensions from "../../hooks/useWindowDimensions";

const groupBy = (items, key) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {}
  );

const ChatMessagesWrapper = styled.div`
  max-height: 450px;
  overflow-y: scroll;
`;

const InputWrapper = styled.div`
  position: fixed;
  bottom: 40px;
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
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { height, width } = useWindowDimensions();
  const messagesEndRef = useRef(null);
  const room = useRef(null);
  const dispatch = useDispatch();
  const history = useHistory();
  const messages = useSelector(getMessages);
  const username = useSelector(userSelector);
  const users = useSelector((state) => state.home.users);
  const peers = useSelector((state) => state.chat.peers);
  const events = useSelector((state) => state.chat.events);
  let peerUsers = peers.map((peer) =>
    users.find((user) => user.peerId === peer)
  );
  peerUsers = peerUsers.filter((user) => user);
  const getTypingPeers = (peerUsers, events) => {
    const groupedEvents = groupBy(events, "peerId");
    const typing = peerUsers.map((user) => {
      if (groupedEvents[user.peerId]) {
        const isTyping = groupedEvents[user.peerId][0].event === "FOCUS_IN";
        return isTyping ? user.username : null;
      }
      return null;
    });
    return typing.filter((el) => el);
  };
  const typingPeers = getTypingPeers(peerUsers, events);
  const { messagesDb, usersDb, ipfs } = props.orbit;
  window.store = store;
  window.addMessage = addMessage;
  window.orbit = props.orbit;
  // window.store.dispatch(window.addMessage({orbit: window.orbit.messagesDb, message: "from console", username: "doe"}))
  window.onbeforeunload = async (event) => {
    return await room.current.leave();
  };

  useEffect(() => {
    setIsMobile(width < 1200);
  }, [width]);

  useEffect(() => {
    if (!username.length) {
      history.push("/");
    }
  }, [username]);

  useEffect(() => {
    if (ipfs && Object.keys(ipfs).length !== 0) {
      room.current = new Room(ipfs, "orbit-chat");
      room.current.on("peer joined", (peer) => {
        dispatch(addPeer(peer));
        dispatch(fetchUsers(usersDb));
      });
      room.current.on("peer left", (peer) => {
        dispatch(removePeer(peer));
      });
      room.current.on("message", (message) => {
        const payload = {
          event: message.data.toString(),
          peerId: message.from,
        };
        dispatch(addEvent(payload));
      });
    }
    return async () => {
      if (room.current) {
        return await room.current.leave();
      }
    };
  }, [ipfs]);

  useEffect(() => {
    if (usersDb && Object.keys(usersDb).length !== 0) {
      dispatch(fetchUsers(usersDb));
      usersDb.events.on("replicated", (address) => {
        dispatch(fetchUsers(usersDb));
      });
    }
  }, [usersDb]);

  useEffect(() => {
    if (messagesDb && Object.keys(messagesDb).length !== 0) {
      dispatch(fetchMessages(messagesDb));
      messagesDb.events.on("replicated", (address) => {
        dispatch(fetchMessages(messagesDb));
      });
    }
  }, [messagesDb]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

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
    room.current.broadcast("FOCUS_IN");
  };

  const focusOut = () => {
    room.current.broadcast("FOCUS_OUT");
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
            {username} -{" "}
            {peers.length ? (
              <span>
                {peers.length} connected peers :{" "}
                {peerUsers.map((peer) => peer.username).join(", ")}
              </span>
            ) : (
              <Timer />
            )}
          </h3>
          <div>
            <br />
            <ChatMessagesWrapper>
              {orderedMessages.map((item, index) => (
                <div key={item.hash}>
                  <div
                    className={`card ${isMobile ? "w-75" : "w-50"} ${
                      index % 2 === 0
                        ? isMobile
                          ? styles.alignRightMobile
                          : styles.alignRight
                        : styles.alignLeft
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
                          className="bi-trash"
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
