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
import { fetchUsers } from "../login/loginSlice";
import styles from "./Chat.module.css";
import moment from "moment";
import { store } from "../../app/store";
import { userSelector } from "../login/loginSlice";
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
  const [rtcPeerConnections, setRtcPeerConnections] = useState([]);
  const { width } = useWindowDimensions();
  const messagesEndRef = useRef(null);
  const chatEventRoom = useRef(null);
  const webrtcRoom = useRef(null);
  const videoRefs = useRef([]);
  const dispatch = useDispatch();
  const history = useHistory();
  const messages = useSelector(getMessages);
  const username = useSelector(userSelector);
  const users = useSelector((state) => state.login.users);
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
  const { messagesDb, usersDb, ipfs } = Object(props.orbit);
  window.store = store;
  window.addMessage = addMessage;
  window.orbit = props.orbit;
  window.rtcPeerConnections = rtcPeerConnections;
  window.webrtcRoom = webrtcRoom;
  // window.store.dispatch(window.addMessage({orbit: window.orbit.messagesDb, message: "from console", username: "doe"}))
  window.onbeforeunload = async (event) => {
    await chatEventRoom.current.leave();
    await webrtcRoom.current.leave();
    return rtcPeerConnections.map((pc) => pc.pc.close());
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsMobile(width < 1200);
  }, [width]);

  useEffect(() => {
    if (!username.length) {
      history.push("/");
    }
  }, [username]);

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
    if (ipfs && Object.keys(ipfs).length !== 0) {
      webrtcRoom.current = new Room(ipfs, "orbit-chat-webrtc");
      chatEventRoom.current = new Room(ipfs, "orbit-chat-event");
      chatEventRoom.current.on("peer joined", async (peer) => {
        dispatch(addPeer(peer));
        dispatch(fetchUsers(usersDb));
        const pc = createRtcPeerConnection(peer);
        const existing = rtcPeerConnections.find(
          (peer) => peer.peerId === pc.peerId
        );
        if (!existing) {
          setRtcPeerConnections((rtcPeerConnections) => [
            ...rtcPeerConnections,
            pc,
          ]);
        }
      });
      chatEventRoom.current.on("peer left", (peer) => {
        dispatch(removePeer(peer));
        setRtcPeerConnections((rtcPeerConnections) =>
          rtcPeerConnections.filter((item) => item.peerId !== peer)
        );
      });
      chatEventRoom.current.on("message", (message) => {
        const payload = {
          event: message.data.toString(),
          peerId: message.from,
        };
        dispatch(addEvent(payload));
      });
    }
    return async () => {
      if (chatEventRoom.current) {
        await chatEventRoom.current.leave();
      }
      if (webrtcRoom.current) {
        await webrtcRoom.current.leave();
      }
      return rtcPeerConnections.map((pc) => pc.pc.close());
    };
  }, [ipfs]);

  useEffect(() => {
    webrtcRoom.current?.on("message", handleRtcRoomMessage);
  }, [rtcPeerConnections]);

  const handleRtcRoomMessage = async (payload) => {
    const connection = rtcPeerConnections.find(
      (pc) => pc.peerId === payload.from
    );
    if (!connection) return;
    const pc = connection.pc;
    const obj = JSON.parse(payload.data.toString());
    let { desc, candidate, user, from, to } = obj;
    const peerId = await ipfs.id();
    if (peerId.id !== to) return;
    if (user === username) return;
    try {
      if (desc) {
        if (desc.type === "offer") {
          desc = { type: "offer", sdp: atob(desc.sdp) };
          await pc.setRemoteDescription(desc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          const payload = await encodeSdp(
            pc.localDescription.sdp,
            "answer",
            from
          );
          webrtcRoom.current.broadcast(payload);
        } else if (desc.type === "answer") {
          desc = { type: "answer", sdp: atob(desc.sdp) };
          await pc.setRemoteDescription(new RTCSessionDescription(desc));
        } else {
          console.log("Unsupported SDP type.");
        }
      } else if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createRtcPeerConnection = (peer) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.services.mozilla.com" },
      ],
    });
    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        const from = await ipfs.id();
        webrtcRoom.current.broadcast(
          JSON.stringify({
            candidate: e.candidate,
            user: username,
            from: from.id,
            to: peer,
          })
        );
      }
    };
    pc.ontrack = async (e) => {
      const existing = videoRefs.current.find(
        (ref) => ref.srcObject?.id === e.streams[0].id
      );
      if (existing) return;
      const videos = videoRefs.current.filter((ref) => ref.srcObject === null);
      if (videos.length) {
        videos[0].srcObject = e.streams[0];
        if (videos[0].paused) {
          await videos[0].play();
        }
      }
    };
    pc.onnegotiationneeded = async (e) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const payload = await encodeSdp(pc.localDescription.sdp, "offer", peer);
      webrtcRoom.current.broadcast(payload);
    };
    return { peerId: peer, pc };
  };

  const streamVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    rtcPeerConnections.forEach((pc) => {
      stream.getTracks().forEach((track) => pc.pc.addTrack(track, stream));
    });
  };

  const encodeSdp = async (sdp, type, peer) => {
    const from = await ipfs.id();
    const obj = {
      desc: {
        type: type,
        sdp: btoa(sdp),
      },
      user: username,
      from: from.id,
      to: peer,
    };
    return JSON.stringify(obj);
  };
  window.encodeSdp = encodeSdp;

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
    chatEventRoom.current.broadcast("FOCUS_IN");
  };

  const focusOut = () => {
    chatEventRoom.current.broadcast("FOCUS_OUT");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const setVideoRef = (ref) => {
    if (ref === null) return;
    const peerId = ref.getAttribute("peerid");
    const existing = videoRefs.current.find(
      (ref) => ref.getAttribute("peerid") === peerId
    );
    if (!existing) {
      videoRefs.current = [...videoRefs.current, ref];
    }
  };

  const orderedMessages = messages
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp);
  return (
    <div className={`container ${styles.containerWrapper}`}>
      <div className="row">
        <div className="col-sm-2 col-md-1"></div>
        <div className="col-sm-8 col-md-10">
          {rtcPeerConnections.map((pc, index) => (
            <video
              autoPlay
              controls
              playsInline
              muted
              ref={setVideoRef}
              peerid={pc.peerId}
              key={index}
              width="150px"
              height="150px"
            ></video>
          ))}
          <button
            onClick={streamVideo}
            className="btn btn-success"
            disabled={!peers.length}
          >
            Stream video
          </button>
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
                      <p className="chat-message">{item.message}</p>
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
              <button
                onClick={inputSubmit}
                className="btn btn-success w-100"
                id="chatSubmit"
              >
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
