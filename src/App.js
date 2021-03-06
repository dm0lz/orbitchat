import React from "react";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import { connect } from "react-redux";
import { Counter } from "./features/counter/Counter";
import { Chat } from "./features/chat/Chat";
import { Login } from "./features/login/Login";
import { Crypto } from "./features/crypto/Crypto";
import { orbitInstance } from "./app/orbit";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { orbit: {} };
  }

  async componentDidMount() {
    const orbitConnector = await orbitInstance();
    this.setState({ orbit: orbitConnector });
  }

  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
              <a className="navbar-brand" href="#">
                DCHAT
              </a>
              <span className="navbar-text">
                <Link to="/" className="nav-link">
                  login
                </Link>
              </span>
              <span className="navbar-text">
                <Link to="/crypto" className="nav-link">
                  crypto
                </Link>
              </span>
              <span className="navbar-text">
                <Link to="/counter" className="nav-link">
                  counter
                </Link>
              </span>
              <span className="navbar-text">
                <Link to="/chat" className="nav-link">
                  chat
                </Link>
              </span>
            </nav>

            {/* A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. */}
            <Switch>
              <Route path="/chat">
                <Chat orbit={this.state.orbit} />
              </Route>
              <Route path="/counter">
                <Counter />
              </Route>
              <Route path="/crypto">
                <Crypto />
              </Route>
              <Route path="/">
                <Login orbit={this.state.orbit} />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  username: state.login.username,
});
const mapDispatchToProps = () => {
  return {
    // increment, decrement
  };
};
// export default App;
export default connect(mapStateToProps, mapDispatchToProps())(App);
