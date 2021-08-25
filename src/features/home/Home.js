import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  destroyUser,
  usernameError,
  loadingStatus,
} from "./homeSlice";
import { useHistory } from "react-router-dom";

export function Home(props) {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const userName = useSelector((state) => state.home.username);
  const errors = useSelector((state) => state.home.errors);
  const status = useSelector((state) => state.home.status);
  const history = useHistory();
  const { orbit } = props;

  window.destroyUser = destroyUser;
  // window.store.getState().home.users.map((user) => window.store.dispatch(window.destroyUser({orbit: window.orbit.usersDb, hash: user.hash})))

  useEffect(() => {
    if (userName.length) {
      history.push("/chat");
    }
  }, [userName]);

  useEffect(() => {
    dispatch(usernameError(null));
    if (username.length) {
      if (orbit?.usersDb) {
        dispatch(createUser({ username, orbit })).then(() => {
          history.push("/chat");
        });
      }
    }
  }, [orbit]);

  const handleOnChange = (event) => {
    setUsername(event.target.value);
  };

  const inputSubmit = () => {
    if (username.length) {
      if (orbit?.usersDb) {
        dispatch(createUser({ username, orbit }));
      } else {
        dispatch(usernameError("Loading database ..."));
        dispatch(loadingStatus("loading"));
      }
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-4 "></div>
        <div className="col-sm-4 ">
          <h3>Enter Username</h3>
          {errors.length ? (
            <div
              className="alert alert-danger alert-dismissible fade show"
              id="alert"
            >
              <div>
                {errors.map((error, index) => (
                  <span key={index}>{error}</span>
                ))}
              </div>
            </div>
          ) : null}
          <div>
            <div>
              <input
                type="text"
                value={username}
                onChange={handleOnChange}
                className="form-control"
              />
              <hr />
              <button
                onClick={inputSubmit}
                className="btn btn-success w-100"
                disabled={status === "loading"}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
        <div className="col-sm-4"></div>
      </div>
    </div>
  );
}
